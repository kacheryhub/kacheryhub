import { VercelRequest, VercelResponse } from '@vercel/node'
import { isChannelConfig, isGetNodeForUserRequest, isGetNodesForUserRequest, isNodeConfig, NodeConfig } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isGetNodeForUserRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)
        if (verifiedUserId !== request.userId) {
            throw Error('Not authorized')
        }

        const db = firestoreDatabase()
        const nodesCollection = db.collection('nodes')
        const channelsCollection = db.collection('channels')
        const nodeResults = await nodesCollection
            .where('ownerId', '==', request.userId)
            .where('nodeId', '==', request.nodeId.toString()).get()
        if (nodeResults.docs.length === 0) {
            throw Error('Node not found')
        }
        if (nodeResults.docs.length > 1) {
            throw Error('More than one node with this id for this owner found')
        }
        const nodeConfig = nodeResults.docs[0].data()
        if (!isNodeConfig(nodeConfig)) {
            console.warn(nodeConfig)
            throw Error('Not a valid node config')
        }
        for (let i = 0; i < nodeConfig.channelMemberships.length; i++) {
            const m = nodeConfig.channelMemberships[i]
            const channelResults = await channelsCollection.where('channelName', '==', m.channelName).get()
            if (channelResults.docs.length === 1) {
                const channelConfig = channelResults.docs[0].data()
                if (isChannelConfig(channelConfig)) {
                    for (let authorizedNode of (channelConfig.authorizedNodes || [])) {
                        if (authorizedNode.nodeId === request.nodeId) {
                            m.authorization = authorizedNode
                        }
                    }
                }
                else {
                    console.warn('Invalid channel config', channelConfig)
                }
            }
        }
        return nodeConfig
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}