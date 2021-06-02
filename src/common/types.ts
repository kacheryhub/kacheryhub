import { isArrayOf, isBoolean, isEqualTo, isNodeId, isNodeLabel, isNumber, isOneOf, isSignature, isString, isTimestamp, NodeId, NodeLabel, optional, Signature, Timestamp, _validateObject } from "./kacheryTypes/kacheryTypes"

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

export type NodeChannelAuthorization = {
    channelName: string
    nodeId: NodeId
    permissions: {
        requestFiles?: boolean
        requestFeeds?: boolean
        requestTaskResults?: boolean
        provideFiles?: boolean
        provideFeeds?: boolean
        provideTaskResults?: boolean
    }
}

export const isNodeChannelAuthorization = (x: any): x is NodeChannelAuthorization => {
    return _validateObject(x, {
        channelName: isString,
        nodeId: isNodeId,
        permissions: {
            downloadFiles: optional(isBoolean),
            downloadFeeds: optional(isBoolean),
            downloadTaskResults: optional(isBoolean),
            requestFiles: optional(isBoolean),
            requestFeeds: optional(isBoolean),
            requestTaskResults: optional(isBoolean),
            provideFiles: optional(isBoolean),
            provideFeeds: optional(isBoolean),
            provideTaskResults: optional(isBoolean)
        }
    })
}

export type ChannelConfig = {
    channelName: string
    ownerId: string
    bucketUri?: string
    googleServiceAccountCredentials?: GoogleServiceAccountCredentials | 'private'
    ablyApiKey?: string | 'private'
    deleted?: boolean
    authorizedNodes?: NodeChannelAuthorization[]
}

export const isChannelConfig = (x: any): x is ChannelConfig => {
    return _validateObject(x, {
        channelName: isString,
        ownerId: isString,
        bucketUri: optional(isString),
        googleServiceAccountCredentials: optional(isOneOf([isGoogleServiceAccountCredentials, isEqualTo('private')])),
        ablyApiKey: optional(isOneOf([isString, isEqualTo('private')])),
        deleted: optional(isBoolean),
        authorizedNodes: optional(isArrayOf(isNodeChannelAuthorization))
    })
}

export type NodeReport = {
    nodeId: NodeId,
    ownerId: string,
    nodeLabel: NodeLabel
}

export const isNodeReport = (x: any): x is NodeReport => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isString,
        nodeLabel: isNodeLabel
    }, {allowAdditionalFields: true})
}

export type NodeChannelMembership = {
    nodeId: NodeId
    channelName: string
    roles: {
        downloadFiles?: boolean
        downloadFeeds?: boolean
        downloadTaskResults?: boolean
        requestFiles?: boolean
        requestFeeds?: boolean
        requestTaskResults?: boolean
        provideFiles?: boolean
        provideFeeds?: boolean
        provideTaskResults?: boolean
    }
    authorization?: NodeChannelAuthorization // obtained by cross-referencing the channels collection
}

const isNodeChannelMembership = (x: any): x is NodeChannelMembership => {
    return _validateObject(x, {
        nodeId: isNodeId,
        channelName: isString,
        roles: {
            downloadFiles: optional(isBoolean),
            downloadFeeds: optional(isBoolean),
            downloadTaskResults: optional(isBoolean),
            requestFiles: optional(isBoolean),
            requestFeeds: optional(isBoolean),
            requestTaskResults: optional(isBoolean),
            provideFiles: optional(isBoolean),
            provideFeeds: optional(isBoolean),
            provideTaskResults: optional(isBoolean)
        },
        authorization: optional(isNodeChannelAuthorization)
    })
}

export type NodeConfig = {
    nodeId: NodeId
    ownerId: string
    channelMemberships?: NodeChannelMembership[]
    lastNodeReport?: NodeReport
    lastNodeReportTimestamp?: Timestamp
    deleted?: boolean
}

export const isNodeConfig = (x: any): x is NodeConfig => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isString,
        channelMemberships: optional(isArrayOf(isNodeChannelMembership)),
        memberships: optional(isNumber), // for historical - remove eventually
        lastNodeReport: optional(isNodeReport),
        lastNodeReportTimestamp: optional(isTimestamp),
        deleted: optional(isBoolean)
    }, {callback: x => {console.log('---', x)}})
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

export type GetNodeForUserRequest = {
    nodeId: NodeId,
    userId: string,
    auth: Auth
}

export const isGetNodeForUserRequest = (x: any): x is GetNodeForUserRequest => {
    return _validateObject(x, {
        nodeId: isNodeId,
        userId: isString,
        auth: isAuth
    })
}

export type GetChannelRequest = {
    channelName: string,
    auth: Auth
}

export const isGetChannelRequest = (x: any): x is GetChannelRequest => {
    return _validateObject(x, {
        channelName: isString,
        auth: isAuth
    })
}

export type AddNodeRequest = {
    node: NodeConfig,
    auth: Auth
}

export const isAddNodeRequest = (x: any): x is AddNodeRequest => {
    return _validateObject(x, {
        node: isNodeConfig,
        auth: isAuth
    })
}

export type DeleteNodeRequest = {
    nodeId: NodeId
    auth: Auth
}

export const isDeleteNodeRequest = (x: any): x is DeleteNodeRequest => {
    return _validateObject(x, {
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type AddNodeChannelMembershipRequest = {
    nodeId: NodeId
    channelName: string
    auth: Auth
}

export const isAddNodeChannelMembershipRequest = (x: any): x is AddNodeChannelMembershipRequest => {
    return _validateObject(x, {
        nodeId: isNodeId,
        channelName: isString,
        auth: isAuth
    })
}

export type AddAuthorizedNodeRequest = {
    channelName: string
    nodeId: NodeId
    auth: Auth
}

export const isAddAuthorizedNodeRequest = (x: any): x is AddAuthorizedNodeRequest => {
    return _validateObject(x, {
        channelName: isString,
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type UpdateNodeChannelAuthorizationRequest = {
    authorization: NodeChannelAuthorization
    auth: Auth
}

export const isUpdateNodeChannelAuthorizationRequest = (x: any): x is UpdateNodeChannelAuthorizationRequest => {
    return _validateObject(x, {
        authorization: isNodeChannelAuthorization,
        auth: isAuth
    })
}

export type DeleteNodeChannelAuthorizationRequest = {
    channelName: string
    nodeId: NodeId
    auth: Auth
}

export const isDeleteNodeChannelAuthorizationRequest = (x: any): x is DeleteNodeChannelAuthorizationRequest => {
    return _validateObject(x, {
        channelName: isString,
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type UpdateNodeChannelMembershipRequest = {
    membership: NodeChannelMembership
    auth: Auth
}

export const isUpdateNodeChannelMembershipRequest = (x: any): x is UpdateNodeChannelMembershipRequest => {
    return _validateObject(x, {
        membership: isNodeChannelMembership,
        auth: isAuth
    })
}

export type DeleteNodeChannelMembershipRequest = {
    channelName: string
    nodeId: NodeId
    auth: Auth
}

export const isDeleteNodeChannelMembershipRequest = (x: any): x is DeleteNodeChannelMembershipRequest => {
    return _validateObject(x, {
        channelName: isString,
        nodeId: isNodeId,
        auth: isAuth
    })
}

export type NodeReportRequestBody = {
    nodeId: NodeId
    ownerId: string
    nodeLabel: NodeLabel
}

export const isNodeReportRequestBody = (x: any): x is NodeReportRequestBody => {
    return _validateObject(x, {
        nodeId: isNodeId,
        ownerId: isString,
        nodeLabel: isNodeLabel
    })
}

export type NodeReportRequest = {
    body: NodeReportRequestBody
    signature: Signature
}

export const isNodeReportRequest = (x: any): x is NodeReportRequest => {
    return _validateObject(x, {
        body: isNodeReportRequestBody,
        signature: isSignature
    })
}