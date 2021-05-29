import { VercelRequest, VercelResponse } from '@vercel/node'
import { isDeleteChannelRequest } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'


module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isDeleteChannelRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)

        const db = firestoreDatabase()
        const channelsCollection = db.collection('channels')
        const channelResults = await channelsCollection.where('channelName', '==', request.channelName).get()
        if (channelResults.docs.length === 0) {
            throw Error(`Channel with name "${request.channel.channelName}" does not exist.`)
        }
        if (channelResults.docs.length > 1) {
            throw Error(`Unexpected: more than one channel with name ${request.channelName}`)
        }
        const doc = channelResults.docs[0]
        if (verifiedUserId !== doc.get('ownerId')) {
            throw Error('Not authorized')
        }
        await doc.ref.delete()
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}