import axios from "axios"
import cacheBust from "../../src/common/cacheBust"
import { isChannelsConfig } from "../../src/common/ChannelsConfig"
import channelsConfigUrl from "./channelsConfigUrl"

const fetchChannelsConfig = async () => {
    const response = await axios.get(cacheBust(channelsConfigUrl))
    const channelsConfig = JSON.parse(response.data)
    if (!isChannelsConfig(channelsConfig)) {
        console.warn(channelsConfig)
        throw Error('Invalid channels config.')
    }
    return channelsConfig
}

export default fetchChannelsConfig