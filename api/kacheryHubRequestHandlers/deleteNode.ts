import { DeleteNodeRequest } from '../../src/common/types/kacheryHubTypes'
import { UserId } from '../../src/common/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const deleteNodeHandler = async (request: DeleteNodeRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
        .where('nodeId', '==', request.nodeId)
        .where('ownerId', '==', verifiedUserId).get()
    if (nodeResults.docs.length === 0) {
        throw Error(`Node with ID "${request.nodeId}" does not exist.`)
    }
    if (nodeResults.docs.length > 1) {
        throw Error(`Unexpected: more than one node with ID ${request.nodeId} for this owner`)
    }
    const doc = nodeResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    await doc.ref.delete()
    return {success: true}
}

export default deleteNodeHandler