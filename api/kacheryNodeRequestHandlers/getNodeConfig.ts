import { isChannelConfig, isNodeConfig } from '../../src/kachery-js/types/kacheryHubTypes'
import { GetNodeConfigRequestBody, GetNodeConfigResponse } from "../../src/kachery-js/types/kacheryNodeRequestTypes"
import { NodeId } from "../../src/kachery-js/types/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"

const getNodeConfigHandler = async (request: GetNodeConfigRequestBody, verifiedNodeId: NodeId): Promise<GetNodeConfigResponse> => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }
    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const channelsCollection = db.collection('channels')
    const nodeResults = await nodesCollection
            .where('nodeId', '==', request.nodeId)
            .where('ownerId', '==', request.ownerId).get()
    if (nodeResults.docs.length === 0) {
        return {
            found: false
        }
    }
    if (nodeResults.docs.length > 1) {
        throw Error(`More than one node found`)
    }
    const nodeConfig = nodeResults.docs[0].data()
    if (!isNodeConfig(nodeConfig)) {
        console.warn(nodeConfig)
        throw Error('Not a valid node config')
    }
    for (let i = 0; i < (nodeConfig.channelMemberships || []).length; i++) {
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
                m.channelBucketUri = channelConfig.bucketUri
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

export default getNodeConfigHandler