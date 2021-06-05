import { GetNodesForUserRequest, isNodeConfig, NodeConfig } from '../../src/common/types/kacheryHubTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const getNodesForUserHandler = async (request: GetNodesForUserRequest, verifiedUserId: string) => {
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection.where('ownerId', '==', request.userId).get()
    const ret: NodeConfig[] = []
    for (let doc of nodeResults.docs) {
        const x = doc.data()
        if (isNodeConfig(x)) {
            if (!x.deleted) {
                ret.push(x)
            }
        }
        else {
            console.warn(JSON.stringify(x, null, 4))
            console.warn('Not a valid node config')
        }
    }
    return ret
}

export default getNodesForUserHandler