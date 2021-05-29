import { isBoolean, isNodeId, isString, NodeId } from './kacheryTypes/kacheryTypes'
import { isArrayOf, optional, _validateObject } from "./misc"

export type AuthorizedNode = {
    nodeId: NodeId
    permissions: {
        requestFile?: boolean
        provideFile?: boolean
        requestSubfeed?: boolean
        provideSubfeed?: boolean
        requestTask?: boolean
        provideTask?: boolean
    }
}
const isAuthorizedNode = (x: any): x is AuthorizedNode => {
    return _validateObject(x, {
        nodeId: isNodeId,
        permissions: {
            requestFile: optional(isBoolean),
            provideFile: optional(isBoolean),
            requestSubfeed: optional(isBoolean),
            provideSubfeed: optional(isBoolean),
            requestTask: optional(isBoolean),
            provideTask: optional(isBoolean)
        }
    })
}

type ChannelConfig = {
    channelName: string,
    authorizedNodes: AuthorizedNode[]
}
export const isChannelConfig = (x: any): x is ChannelConfig => {
    return _validateObject(x, {
        channelName: isString,
        authorizedNodes: isArrayOf(isAuthorizedNode)
    })
}

export default ChannelConfig