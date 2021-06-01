import { VercelRequest, VercelResponse } from '@vercel/node'
import { isAddChannelRequest } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isAddChannelRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)
        if (verifiedUserId !== request.channel.ownerId) {
            throw Error('Not authorized')
        }

        const db = firestoreDatabase()
        const channelsCollection = db.collection('channels')
        const channelResults = await channelsCollection.where('channelName', '==', request.channel.channelName).get()
        if (channelResults.docs.length > 0) {
            if ((channelResults.docs.length === 1) && (channelResults.docs[0].get('ownerId') === request.channel.ownerId) && (channelResults.docs[0].get('deleted'))) {
                await channelResults.docs[0].ref.delete()
            }
            else {
                throw Error(`Channel with name "${request.channel.channelName}" already exists.`)
            }
        }
        await channelsCollection.add(request.channel)
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}