import { isRegisteredTaskFunction, RegisteredTaskFunction } from "./kacheryHubTypes";
import { ErrorMessage, FeedId, FileKey, isArrayOf, isEqualTo, isErrorMessage, isFeedId, isFileKey, isMessageCount, isNodeId, isNull, isOneOf, isSignature, isSignedSubfeedMessage, isString, isSubfeedHash, isSubfeedPosition, isTaskFunctionId, isTaskFunctionType, isTaskId, isTaskKwargs, isTaskStatus, MessageCount, NodeId, optional, Signature, SignedSubfeedMessage, SubfeedHash, SubfeedPosition, TaskFunctionId, TaskFunctionType, TaskId, TaskKwargs, TaskStatus, _validateObject } from "../commonInterface/kacheryTypes";

export type RequestFileMessageBody = {
    type: 'requestFile',
    fileKey: FileKey
}

export const isRequestFileMessageBody = (x: any): x is RequestFileMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('requestFile'),
        fileKey: isFileKey
    })
}

export type UploadFileStatusMessageBody = {
    type: 'uploadFileStatus',
    fileKey: FileKey,
    status: 'started' | 'finished'
}

export const isUploadFileStatusMessageBody = (x: any): x is UploadFileStatusMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('uploadFileStatus'),
        fileKey: isFileKey,
        status: isOneOf(['started', 'finished'].map(s => isEqualTo(s)))
    })
}

// export type UpdateSubfeedMessageCountMessageBody = {
//     type: 'updateSubfeedMessageCount',
//     feedId: FeedId,
//     subfeedHash: SubfeedHash,
//     messageCount: MessageCount
// }

// export const isUpdateSubfeedMessageCountMessageBody = (x: any): x is UpdateSubfeedMessageCountMessageBody => {
//     return _validateObject(x, {
//         type: isEqualTo('updateSubfeedMessageCount'),
//         feedId: isFeedId,
//         subfeedHash: isSubfeedHash,
//         messageCount: isMessageCount
//     })
// }

// export type RequestSubfeedMessageBody = {
//     type: 'requestSubfeed',
//     feedId: FeedId,
//     subfeedHash: SubfeedHash,
//     position: SubfeedPosition
// }

// export const isRequestSubfeedMessageBody = (x: any): x is RequestSubfeedMessageBody => {
//     return _validateObject(x, {
//         type: isEqualTo('requestSubfeed'),
//         feedId: isFeedId,
//         subfeedHash: isSubfeedHash,
//         position: isSubfeedPosition
//     })
// }

export type NewSubfeedMessagesMessageBody = {
    type: 'newSubfeedMessages'
    feedId: FeedId
    subfeedHash: SubfeedHash
    messages: SignedSubfeedMessage[]
}

export const isNewSubfeedMessagesMessageBody = (x: any): x is NewSubfeedMessagesMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('newSubfeedMessages'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        messages: isArrayOf(isSignedSubfeedMessage)
    })
}

export type NumSubfeedMessagesUploadedMessageBody = {
    type: 'numSubfeedMessagesUploaded'
    feedId: FeedId
    subfeedHash: SubfeedHash
    numMessages: MessageCount
}

export const isNumSubfeedMessagesUploadedMessageBody = (x: any): x is NumSubfeedMessagesUploadedMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('numSubfeedMessagesUploaded'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        numMessages: isMessageCount
    })
}

export type SubscribeToSubfeedMessageBody = {
    type: 'subscribeToSubfeed'
    feedId: FeedId
    subfeedHash: SubfeedHash
    position: SubfeedPosition
}

export const isSubscribeToSubfeedMessageBody = (x: any): x is SubscribeToSubfeedMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('subscribeToSubfeed'),
        feedId: isFeedId,
        subfeedHash: isSubfeedHash,
        position: isSubfeedPosition
    })
}

export type UpdateTaskStatusMessageBody = {
    type: 'updateTaskStatus',
    taskId: TaskId,
    status: TaskStatus,
    errorMessage?: ErrorMessage
}

export const isUpdateTaskStatusMessageBody = (x: any): x is UpdateTaskStatusMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('updateTaskStatus'),
        taskId: isTaskId,
        status: isTaskStatus,
        errorMessage: optional(isErrorMessage)
    })
}

export type RequestTaskMessageBody = {
    type: 'requestTask',
    backendId?: string | null,
    taskId: TaskId,
    taskFunctionId: TaskFunctionId,
    taskFunctionType: TaskFunctionType,
    taskKwargs: TaskKwargs
}

export const isRequestTaskMessageBody = (x: any): x is RequestTaskMessageBody => {
    return _validateObject(x, {
        type: isEqualTo('requestTask'),
        backendId: optional(isOneOf([isString, isNull])),
        taskId: isTaskId,
        taskFunctionId: isTaskFunctionId,
        taskFunctionType: isTaskFunctionType,
        taskKwargs: isTaskKwargs
    })
}

export type ProbeTaskFunctionsBody = {
    type: 'probeTaskFunctions',
    taskFunctionIds: TaskFunctionId[],
    backendId?: string | null
}

export const isProbeTaskFunctionsBody = (x: any): x is ProbeTaskFunctionsBody => {
    return _validateObject(x, {
        type: isEqualTo('probeTaskFunctions'),
        taskFunctionIds: isArrayOf(isTaskFunctionId),
        backendId: optional(isOneOf([isString, isNull])),
    })
}

export type ReportRegisteredTaskFunctionsBody = {
    type: 'reportRegisteredTaskFunctions',
    registeredTaskFunctions: RegisteredTaskFunction[]
}

export const isReportRegisteredTaskFunctionsBody = (x: any): x is ReportRegisteredTaskFunctionsBody => {
    return _validateObject(x, {
        type: isEqualTo('reportRegisteredTaskFunctions'),
        registeredTaskFunctions: isArrayOf(isRegisteredTaskFunction)
    })
}

export type KacheryHubPubsubMessageBody = 
    RequestFileMessageBody |
    UploadFileStatusMessageBody |
    // UpdateSubfeedMessageCountMessageBody |
    // RequestSubfeedMessageBody |
    UpdateTaskStatusMessageBody |
    RequestTaskMessageBody |
    ProbeTaskFunctionsBody |
    ReportRegisteredTaskFunctionsBody |
    SubscribeToSubfeedMessageBody |
    NewSubfeedMessagesMessageBody |
    NumSubfeedMessagesUploadedMessageBody

export const isKacheryHubPubsubMessageBody = (x: any): x is KacheryHubPubsubMessageBody => {
    return isOneOf([
        isRequestFileMessageBody,
        isUploadFileStatusMessageBody,
        // isUpdateSubfeedMessageCountMessageBody,
        // isRequestSubfeedMessageBody,
        isUpdateTaskStatusMessageBody,
        isRequestTaskMessageBody,
        isProbeTaskFunctionsBody,
        isReportRegisteredTaskFunctionsBody,
        isSubscribeToSubfeedMessageBody,
        isNewSubfeedMessagesMessageBody,
        isNumSubfeedMessagesUploadedMessageBody
    ])(x)
}

export type KacheryHubPubsubMessageData = {
    body: KacheryHubPubsubMessageBody,
    fromNodeId: NodeId,
    signature: Signature
}

export const isKacheryHubPubsubMessageData = (x: any): x is KacheryHubPubsubMessageData => {
    return _validateObject(x, {
        body: isKacheryHubPubsubMessageBody,
        fromNodeId: isNodeId,
        signature: isSignature
    })
}
