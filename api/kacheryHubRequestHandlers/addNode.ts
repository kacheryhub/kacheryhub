import { AddNodeRequest } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'

const addNodeHandler = async (request: AddNodeRequest, verifiedUserId: string) => {
    if (verifiedUserId !== request.node.ownerId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
            .where('nodeId', '==', request.node.nodeId)
            .where('ownerId', '==', verifiedUserId).get()
    if (nodeResults.docs.length > 0) {
        throw Error(`Node with ID "${request.node.nodeId}" already exists for this owner.`)
    }
    await nodesCollection.add(request.node)
    return {success: true}
}

export default addNodeHandler