import { VercelRequest, VercelResponse } from '@vercel/node'
import { ChannelConfig, isAddChannelRequest, isChannelConfig } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'


module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isAddChannelRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        console.log('---- add channel 1')
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)
        if (verifiedUserId !== request.channel.ownerId) {
            throw Error('Not authorized')
        }

        const db = firestoreDatabase()
        const channelsCollection = db.collection('channels')
        console.log('---- add channel 2')
        const channelResults = await channelsCollection.where('channelName', '==', request.channel.channelName).get()
        if (channelResults.docs.length > 0) {
            throw Error('Channel with name already exists.')
        }
        console.log('---- add channel 3')
        await channelsCollection.add(request.channel)
        console.log('---- add channel 4')
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}