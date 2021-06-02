import { isEqualTo, isNodeId, isNodeLabel, isOneOf, isSignature, isString, NodeId, NodeLabel, Signature, _validateObject } from "../../src/common/kacheryTypes/kacheryTypes";

export type ReportRequestBody = {
    type: 'report'
    nodeId: NodeId
    ownerId: string
    nodeLabel: NodeLabel
}

export const isReportRequestBody = (x: any): x is ReportRequestBody => {
    return _validateObject(x, {
        type: isEqualTo('report'),
        nodeId: isNodeId,
        ownerId: isString,
        nodeLabel: isNodeLabel
    })
}

export type ReportRequest = {
    body: ReportRequestBody
    nodeId: NodeId,
    signature: Signature
}

export const isReportRequest = (x: any): x is ReportRequest => {
    return _validateObject(x, {
        body: isReportRequestBody,
        nodeId: isNodeId,
        signature: isSignature
    })
}

export type GetNodeConfigRequestBody = {
    type: 'getNodeConfig'
    nodeId: NodeId
    ownerId: string
}

export const isGetNodeConfigRequestBody = (x: any): x is GetNodeConfigRequestBody => {
    return _validateObject(x, {
        type: isEqualTo('getNodeConfig'),
        nodeId: isNodeId,
        ownerId: isString
    })
}

export type GetNodeConfigRequest = {
    body: GetNodeConfigRequestBody
    nodeId: NodeId
    signature: Signature
}

export const isGetNodeConfigRequest = (x: any): x is GetNodeConfigRequest => {
    return _validateObject(x, {
        body: isReportRequestBody,
        nodeId: isNodeId,
        signature: isSignature
    })
}

export type KacheryNodeRequest =
    ReportRequest | GetNodeConfigRequest

export const isKacheryNodeRequest = (x: any): x is KacheryNodeRequest => {
    return isOneOf([
        isReportRequest,
        isGetNodeConfigRequest
    ])(x)
}