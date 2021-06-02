import { GetChannelRequest, isChannelConfig } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'
import hideChannelSecrets from '../common/hideChannelSecrets'

const getChannelHandler = async (request: GetChannelRequest, verifiedUserId: string) => {
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
}

export default getChannelHandler