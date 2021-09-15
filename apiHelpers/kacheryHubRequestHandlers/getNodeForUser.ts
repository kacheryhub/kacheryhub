import { GetNodeForUserRequest, GetNodeForUserResponse, isChannelConfig, isNodeConfig } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserId } from '../../src/commonInterface/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import { loadNodeChannelAuthorization } from '../common/loadChannelConfig'

const getNodeForUserHandler = async (request: GetNodeForUserRequest, verifiedUserId: UserId): Promise<GetNodeForUserResponse> => {
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
        return {
            found: false
        }
    }
    if (nodeResults.docs.length > 1) {
        throw Error('More than one node with this id for this owner found')
    }
    const nodeConfig = nodeResults.docs[0].data()
    if (!isNodeConfig(nodeConfig)) {
        console.warn(nodeConfig)
        throw Error('Not a valid node config')
    }
    for (let i = 0; i < (nodeConfig.channelMemberships || []).length; i++) {
        const m = (nodeConfig.channelMemberships || [])[i]
        try {
            const {authorization, validPasscodes} = await loadNodeChannelAuthorization({channelName: m.channelName, nodeId: request.nodeId, nodeOwnerId: verifiedUserId})
            m.authorization = authorization
            m.validChannelPasscodes = validPasscodes
        }
        catch(err) {
            console.warn('Problem loading node channel authorization', m.channelName, request.nodeId, verifiedUserId, err)
        }
        const channelResults = await channelsCollection.where('channelName', '==', m.channelName).get()
        if (channelResults.docs.length === 1) {
            const channelConfig = channelResults.docs[0].data()
            if (isChannelConfig(channelConfig)) {
                m.channelBucketUri = channelConfig.bucketUri
                m.channelResourceId = channelConfig.bitwooderResourceId
            }
            else {
                console.warn('Invalid channel config', channelConfig)
            }
        }
    }
    return {
        found: true,
        nodeConfig
    }
}

export default getNodeForUserHandler