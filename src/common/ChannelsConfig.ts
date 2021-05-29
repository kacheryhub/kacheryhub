import { isString } from './kacheryTypes/kacheryTypes'
import { isArrayOf, _validateObject } from "./misc"

export type ChannelsConfigChannel = {
    channelName: string,
    adminId: string
}
const isChannelsConfigChannel = (x: any): x is ChannelsConfigChannel => {
    return _validateObject(x, {
        channelName: isString,
        adminId: isString
    })
}

type ChannelsConfig = {
    channels: ChannelsConfigChannel[]
}
export const isChannelsConfig = (x: any): x is ChannelsConfig => {
    return _validateObject(x, {
        channels: isArrayOf(isChannelsConfigChannel)
    })
}

export default ChannelsConfig