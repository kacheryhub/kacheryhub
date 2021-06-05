import { ReportRequestBody } from "../../src/common/types/kacheryNodeRequestTypes"
import { NodeId, nowTimestamp } from "../../src/common/types/kacheryTypes"
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
        throw Error(`Node not found in reportHandler: ${request.nodeId} ${request.ownerId}`)
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