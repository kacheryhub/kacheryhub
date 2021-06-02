import { nowTimestamp } from "../../src/common/kacheryTypes/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"
import { ReportRequestBody } from "./types"

const reportHandler = async (request: ReportRequestBody) => {
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