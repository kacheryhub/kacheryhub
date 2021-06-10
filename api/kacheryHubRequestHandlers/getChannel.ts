import { GetChannelRequest, isChannelConfig, isNodeConfig, NodeChannelMembership, NodeConfig } from '../../src/common/types/kacheryHubTypes'
import { UserId } from '../../src/common/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import hideChannelSecrets from '../common/hideChannelSecrets'
import loadChannelConfig from '../common/loadChannelConfig'

const getChannelHandler = async (request: GetChannelRequest, verifiedUserId: UserId) => {
    const { channelName } = request
    const channelConfig = await loadChannelConfig({channelName})
    if (!isChannelConfig(channelConfig)) throw Error('Not a valid channel config')
    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
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
            const channelMembership = nodeConfig.channelMemberships.filter((cm: NodeChannelMembership) => (cm.channelName === channelName))[0]
            if (channelMembership) {
                authorizedNode.roles = channelMembership.roles
            }
        }
    }
    return hideChannelSecrets(channelConfig)
}

export default getChannelHandler