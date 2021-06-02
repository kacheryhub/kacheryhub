import { GetNodeForUserRequest, isChannelConfig, isNodeConfig } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'

const getNodeForUserHandler = async (request: GetNodeForUserRequest, verifiedUserId: string) => {
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
}

export default getNodeForUserHandler