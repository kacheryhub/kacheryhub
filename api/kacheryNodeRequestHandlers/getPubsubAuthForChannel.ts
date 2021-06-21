import { isChannelConfig, PubsubAuth } from '../../src/kachery-js/types/kacheryHubTypes'
import { GetPubsubAuthForChannelRequestBody, GetPubsubAuthForChannelResponse } from "../../src/kachery-js/types/kacheryNodeRequestTypes"
import { NodeId } from "../../src/kachery-js/types/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"
import createAblyTokenRequest from './createAblyTokenRequest'

const getPubsubAuthForChannelHandler = async (request: GetPubsubAuthForChannelRequestBody, verifiedNodeId: NodeId): Promise<PubsubAuth> => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
            .where('channelName', '==', request.channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel not found: ${request.channelName}`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`More than one channel record found: ${request.channelName}`)
    }
    const channelConfig = channelResults.docs[0].data()
    if (!isChannelConfig(channelConfig)) {
        console.warn(channelConfig)
        throw Error('Not a valid channel config')
    }
    const authorizedNode = (channelConfig.authorizedNodes || []).filter(n => (n.nodeId === request.nodeId))[0]
    if (!authorizedNode) {
        throw Error('Node not authorized on this channel')
    }
    const ablyTokenRequest = await createAblyTokenRequest(channelConfig, authorizedNode)
    const response: GetPubsubAuthForChannelResponse = {
        ablyTokenRequest
    }
    return response
}

export default getPubsubAuthForChannelHandler