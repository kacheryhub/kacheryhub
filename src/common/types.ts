import { isEqualTo, isNodeId, isOneOf, isString, NodeId, optional, _validateObject } from "./kacheryTypes/kacheryTypes"

export type GoogleServiceAccountCredentials = {
    type: 'service_account',
    project_id: string,
    private_key_id: string,
    private_key: string,
    client_email: string,
    client_id: string
}

export const isGoogleServiceAccountCredentials = (x: any): x is GoogleServiceAccountCredentials => {
    return _validateObject(x, {
        type: isEqualTo('service_account'),
        project_id: isString,
        private_key_id: isString,
        private_key: isString,
        client_email: isString,
        client_id: isString,
    }, {allowAdditionalFields: true})
}

export type ChannelConfig = {
    channelName: string
    ownerId: string
    bucketUri?: string
    googleServiceAccountCredentials?: GoogleServiceAccountCredentials | 'private'
    ablyApiKey?: string | 'private'
}

export const isChannelConfig = (x: any): x is ChannelConfig => {
    return _validateObject(x, {
        channelName: isString,
        ownerId: isString,
        bucketUri: optional(isString),
        googleServiceAccountCredentials: optional(isOneOf([isGoogleServiceAccountCredentials, isEqualTo('private')])),
        ablyApiKey: optional(isOneOf([isString, isEqualTo('private')]))
    })
}

export type NodeConfig = {
    nodeId: NodeId
    ownerId: string
    label: string
}

export const isNodeConfig = (x: any): x is NodeConfig => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isString,
        label: isString
    })
}

export type Auth = {
    userId?: string,
    googleIdToken?: string
}

export const isAuth = (x: any): x is Auth => {
    return _validateObject(x, {
            userId: optional(isString),
            googleIdToken: optional(isString)
    })
}

export type GetChannelsForUserRequest = {
    userId: string,
    auth: Auth
}

export const isGetChannelsForUserRequest = (x: any): x is GetChannelsForUserRequest => {
    return _validateObject(x, {
        userId: isString,
        auth: isAuth
    })
}

export type AddChannelRequest = {
    channel: ChannelConfig,
    auth: Auth
}

export const isAddChannelRequest = (x: any): x is AddChannelRequest => {
    return _validateObject(x, {
        channel: isChannelConfig,
        auth: isAuth
    })
}

export type DeleteChannelRequest = {
    channelName: string
    auth: Auth
}

export const isDeleteChannelRequest = (x: any): x is DeleteChannelRequest => {
    return _validateObject(x, {
        channelName: isString,
        auth: isAuth
    })
}

export type GetNodesForUserRequest = {
    userId: string,
    auth: Auth
}

export const isGetNodesForUserRequest = (x: any): x is GetNodesForUserRequest => {
    return _validateObject(x, {
        userId: isString,
        auth: isAuth
    })
}
