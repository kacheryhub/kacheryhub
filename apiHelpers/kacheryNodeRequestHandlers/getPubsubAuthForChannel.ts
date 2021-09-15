import { isChannelConfig, PubsubAuth } from '../../src/kacheryInterface/kacheryHubTypes'
import { GetPubsubAuthForChannelRequestBody, GetPubsubAuthForChannelResponse } from "../../src/kacheryInterface/kacheryNodeRequestTypes"
import { NodeId } from "../../src/commonInterface/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"
import { loadNodeChannelAuthorization } from '../common/loadChannelConfig'
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
    const {authorization} = await loadNodeChannelAuthorization({channelName: request.channelName, nodeId: request.nodeId, nodeOwnerId: request.ownerId})
    // const authorizedNode = (channelConfig.authorizedNodes || []).filter(n => (n.nodeId === request.nodeId))[0]
    if (!authorization) {
        throw Error('Node not authorized on this channel')
    }
    const ablyTokenRequest = await createAblyTokenRequest(channelConfig, authorization)
    const response: GetPubsubAuthForChannelResponse = {
        ablyTokenRequest
    }
    return response
}

export default getPubsubAuthForChannelHandler