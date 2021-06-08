import { GetChannelRequest, isChannelConfig, isNodeConfig, NodeConfig } from '../../src/common/types/kacheryHubTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import hideChannelSecrets from '../common/hideChannelSecrets'

const getChannelHandler = async (request: GetChannelRequest, verifiedUserId: string) => {
    const db = firestoreDatabase()
    const { channelName } = request
    const nodesCollection = db.collection('nodes')
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error('Channel not found')
    }
    if (channelResults.docs.length > 1) {
        throw Error('More than one channel with this name found')
    }
    const channelConfig = channelResults.docs[0].data()
    if (!isChannelConfig(channelConfig)) throw Error('Not a valid channel config')
    for (let authorizedNode of channelConfig.authorizedNodes) {
        const nodeResults = await nodesCollection
            .where('nodeId', '==', authorizedNode.nodeId).get()
        const nodeConfigs = nodeResults.docs.map(doc => {
            const docData = doc.data()
            if (!isNodeConfig(docData)) {
                console.warn(docData)
                throw Error('Invalid node config for node in channel')
            }
            return docData as NodeConfig
        }).sort((a, b) => {
            if ((a.lastNodeReportTimestamp) && (!b.lastNodeReportTimestamp)) {
                return 1
            }
            else if ((!a.lastNodeReportTimestamp) && (b.lastNodeReportTimestamp)) {
                return -1
            }
            else if ((a.lastNodeReportTimestamp) && (b.lastNodeReportTimestamp)) {
                return Number(b.lastNodeReportTimestamp) - Number(a.lastNodeReportTimestamp)
            }
            else return 0
        })
        if (nodeConfigs.length > 0) {
            const nodeConfig = nodeConfigs[0]
            const channelMembership = nodeConfig.channelMemberships.filter(cm => (cm.channelName === channelName))[0]
            if (channelMembership) {
                authorizedNode.roles = channelMembership.roles
            }
        }
    }
    return hideChannelSecrets(channelConfig)
}

export default getChannelHandler