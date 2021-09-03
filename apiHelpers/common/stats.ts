import firestoreDatabase from "./firestoreDatabase"
import {FieldValue} from '@google-cloud/firestore'

export const statsReportNodeRequest = async (a: {type: string, nodeId: string, channelName?: string}) => {
    const {type, nodeId, channelName} = a
    const db = firestoreDatabase()
    const increment = FieldValue.increment(1)

    const nodeStatsCollection = db.collection('nodeStats')
    const nodeStatsRef = nodeStatsCollection.doc(nodeId)
    await nodeStatsRef.set({[type]: increment}, {merge: true})

    if (channelName) {
        const channelStatsCollection = db.collection('channelStats')
        const channelStatsRef = channelStatsCollection.doc(channelName)
        await channelStatsRef.set({[type]: increment}, {merge: true})
    }
}

export const statsReportFileUpload = async (a: {nodeId: string, channelName: string, size: number}) => {
    const {nodeId, channelName, size} = a
    const db = firestoreDatabase()
    const increment = FieldValue.increment(size)

    const nodeStatsCollection = db.collection('nodeStats')
    const nodeStatsRef = nodeStatsCollection.doc(nodeId)
    await nodeStatsRef.set({fileUploads: increment}, {merge: true})

    const channelStatsCollection = db.collection('channelStats')
    const channelStatsRef = channelStatsCollection.doc(channelName)
    await channelStatsRef.set({fileUploads: increment}, {merge: true})
}

export const statsReportUploadFeedMessages = async (a: {nodeId: string, channelName: string, numMessages: number}) => {
    const {nodeId, channelName, numMessages} = a
    const db = firestoreDatabase()
    const increment = FieldValue.increment(numMessages)

    const nodeStatsCollection = db.collection('nodeStats')
    const nodeStatsRef = nodeStatsCollection.doc(nodeId)
    await nodeStatsRef.set({feedMessages: increment}, {merge: true})

    const channelStatsCollection = db.collection('channelStats')
    const channelStatsRef = channelStatsCollection.doc(channelName)
    await channelStatsRef.set({feedMessages: increment}, {merge: true})
}

export const statsReportTaskResultUpload = async (a: {nodeId: string, channelName: string, size: number}) => {
    const {nodeId, channelName, size} = a
    const db = firestoreDatabase()
    const increment = FieldValue.increment(size)

    const nodeStatsCollection = db.collection('nodeStats')
    const nodeStatsRef = nodeStatsCollection.doc(nodeId)
    await nodeStatsRef.set({taskUploads: increment}, {merge: true})

    const channelStatsCollection = db.collection('channelStats')
    const channelStatsRef = channelStatsCollection.doc(channelName)
    await channelStatsRef.set({taskUploads: increment}, {merge: true})
}

export const statsReportNodeRequestError = async (a: {type: string, nodeId: string, channelName?: string}) => {
    const {type, nodeId, channelName} = a
    const db = firestoreDatabase()
    const increment = FieldValue.increment(1)

    const nodeStatsCollection = db.collection('nodeStats')
    const nodeStatsRef = nodeStatsCollection.doc(nodeId)
    await nodeStatsRef.set({['error-' + type]: increment}, {merge: true})

    if (channelName) {
        const channelStatsCollection = db.collection('channelStats')
        const channelStatsRef = channelStatsCollection.doc(channelName)
        await channelStatsRef.set({['error-' + type]: increment}, {merge: true})
    }
}