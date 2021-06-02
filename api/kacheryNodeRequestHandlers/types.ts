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
    signature: Signature
}

export const isReportRequest = (x: any): x is ReportRequest => {
    return _validateObject(x, {
        body: isReportRequestBody,
        signature: isSignature
    })
}

export type KacheryNodeRequest =
    ReportRequest

export const isKacheryNodeRequest = (x: any): x is KacheryNodeRequest => {
    return isOneOf([
        isReportRequest
    ])(x)
}