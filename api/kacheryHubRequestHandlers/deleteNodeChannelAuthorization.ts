import { DeleteNodeChannelAuthorizationRequest, NodeChannelAuthorization } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'

const deleteNodeChannelAuthorizationHandler = async (request: DeleteNodeChannelAuthorizationRequest, verifiedUserId: string) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel with name "${request.channelName}" does not exist.`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`Unexpected: more than one channel with name ${request.channelName}`)
    }
    const doc = channelResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    const authorizedNodes: NodeChannelAuthorization[] = doc.get('authorizedNodes') || []
    if (!authorizedNodes.map(x => x.nodeId).includes(request.nodeId)) {
        throw Error('Authorized node not found')
    }
    await doc.ref.update({
        authorizedNodes: authorizedNodes.filter(x => (x.nodeId !== request.nodeId))
    })
    return {success: true}
}

export default deleteNodeChannelAuthorizationHandler