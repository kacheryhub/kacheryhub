import { isChannelConfig, isNodeConfig, NodeChannelAuthorization, Passcode } from "../../src/kachery-js/types/kacheryHubTypes"
import { ChannelName, NodeId, UserId } from "../../src/kachery-js/types/kacheryTypes"
import firestoreDatabase from "./firestoreDatabase"

const loadChannelConfig = async (args: {channelName: ChannelName}) => {
    const { channelName } = args
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
            .where('channelName', '==', channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel not found: ${channelName}`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`More than one channel record found: ${channelName}`)
    }
    const channelConfig = channelResults.docs[0].data()
    if (!isChannelConfig(channelConfig)) {
        console.warn(channelConfig)
        throw Error('Unexpected, not a valid channel config')
    }
    return channelConfig
}

const loadNodeConfig = async (args: {nodeId: NodeId, ownerId: UserId}) => {
    const { nodeId, ownerId } = args

    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
        .where('ownerId', '==', ownerId.toString())
        .where('nodeId', '==', nodeId.toString()).get()
    if (nodeResults.docs.length === 0) {
        throw Error('Node not found.')
    }
    if (nodeResults.docs.length > 1) {
        throw Error('More than one node with this id for this owner found')
    }
    const nodeConfig = nodeResults.docs[0].data()
    if (!isNodeConfig(nodeConfig)) {
        console.warn(nodeConfig)
        throw Error('Not a valid node config')
    }
    return nodeConfig
}

export const loadNodeChannelAuthorization = async (args: {channelName: ChannelName, nodeId: NodeId, nodeOwnerId: UserId}) => {
    const {channelName, nodeId, nodeOwnerId} = args
    const channelConfig = await loadChannelConfig({channelName})
    const authorization: NodeChannelAuthorization = (channelConfig.authorizedNodes || []).filter(n => (n.nodeId === nodeId))[0] || {
        channelName,
        nodeId,
        permissions: {}
    }
    const validPasscodes: Passcode[] = []
    const nodeConfig = await loadNodeConfig({nodeId, ownerId: nodeOwnerId})
    const channelMembership = (nodeConfig.channelMemberships || []).filter(m => (m.channelName === channelName))[0]
    if (channelMembership) {
        for (const pc of (channelMembership.channelPasscodes || [])) {
            const authorizedPasscode = (channelConfig.authorizedPasscodes || []).filter(x => (x.passcode === pc))[0]
            if (authorizedPasscode) {
                for (let k of ['requestFiles', 'provideFiles', 'requestFeeds', 'provideFeeds', 'requestTasks', 'provideTasks']) {
                    authorization.permissions[k] = authorization.permissions[k] || authorizedPasscode.permissions[k]
                }
                validPasscodes.push(pc)
            }
        }
    }
    return {authorization, validPasscodes}
}

export default loadChannelConfig