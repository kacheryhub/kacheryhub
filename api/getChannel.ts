import { VercelRequest, VercelResponse } from '@vercel/node'
import { isChannelConfig, isGetChannelRequest } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'
import hideChannelSecrets from './common/hideChannelSecrets'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isGetChannelRequest(request)) {
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
        const channelResults = await channelsCollection
            .where('channelName', '==', request.channelName).get()
        if (channelResults.docs.length === 0) {
            throw Error('Channel not found')
        }
        if (channelResults.docs.length > 1) {
            throw Error('More than one channel with this name found')
        }
        const channelConfig = channelResults.docs[0].data()
        if (!isChannelConfig(channelConfig)) throw Error('Not a valid channel config')
        // for (let i = 0; i < nodeConfig.channelMemberships.length; i++) {
        //     const m = nodeConfig.channelMemberships[i]
        //     const channelResults = await channelsCollection.where('channelName', '==', m.channelName).get()
        //     if (channelResults.docs.length === 1) {
        //         const channelConfig = channelResults.docs[0].data()
        //         if (isChannelConfig(channelConfig)) {
        //             for (let authorizedNode of (channelConfig.authorizedNodes || [])) {
        //                 if (authorizedNode.nodeId === request.nodeId) {
        //                     m.authorization = authorizedNode
        //                 }
        //             }
        //         }
        //         else {
        //             console.warn('Invalid channel config', channelConfig)
        //         }
        //     }
        // }
        return hideChannelSecrets(channelConfig)
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}