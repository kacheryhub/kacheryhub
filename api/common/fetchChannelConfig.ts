import axios from "axios"
import fetchChannelsConfig from "./fetchChannelsConfig"
import {isChannelConfig} from '../../src/common/ChannelConfig'
import cacheBust from "../../src/common/cacheBust"
import channelConfigUrl from "./channelConfigUrl"

const fetchChannelConfig = async (channelName: string) => {
    const channelsConfig = await fetchChannelsConfig()
    const x = channelsConfig.channels.filter(c => (c.channelName === channelName))[0]
    if (!x) throw Error(`Channel not found: ${channelName}`)
    const response = await axios.get(cacheBust(channelConfigUrl(channelName)))
    const channelConfig = JSON.parse(response.data)
    if (!isChannelConfig(channelConfig)) {
        console.warn(channelConfig)
        throw Error('Invalid channel config.')
    }
    return channelConfig
}

export default fetchChannelConfig