import { isChannelConfig } from "../../src/common/types/kacheryHubTypes"
import { ChannelName } from "../../src/common/types/kacheryTypes"
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

export default loadChannelConfig