import { ReportRequestBody } from "../../src/common/kacheryNodeRequestTypes"
import { NodeId, nowTimestamp } from "../../src/common/kacheryTypes/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"

const reportHandler = async (request: ReportRequestBody, verifiedNodeId: NodeId) => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }
    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
            .where('nodeId', '==', request.nodeId)
            .where('ownerId', '==', request.ownerId).get()
    if (nodeResults.docs.length === 0) {
        throw Error(`Node not found`)
    }
    if (nodeResults.docs.length > 1) {
        throw Error(`More than one node found`)
    }
    await nodeResults.docs[0].ref.update({
        lastNodeReport: request,
        lastNodeReportTimestamp: nowTimestamp()
    })
    return {success: true}
}

export default reportHandler