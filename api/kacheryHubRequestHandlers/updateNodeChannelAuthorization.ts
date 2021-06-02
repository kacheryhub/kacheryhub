import { NodeChannelAuthorization, UpdateNodeChannelAuthorizationRequest } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'

const updateNodeChannelAuthorizationHandler = async (request: UpdateNodeChannelAuthorizationRequest, verifiedUserId: string) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.authorization.channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel with name "${request.authorization.channelName}" does not exist.`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`Unexpected: more than one channel with name ${request.authorization.channelName}`)
    }
    const doc = channelResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    const authorizedNodes: NodeChannelAuthorization[] = doc.get('authorizedNodes') || []
    if (!authorizedNodes.map(x => x.nodeId).includes(request.authorization.nodeId)) {
        throw Error('Authorized node not found')
    }
    await doc.ref.update({
        authorizedNodes: authorizedNodes.map(x => (x.nodeId === request.authorization.nodeId ? request.authorization : x))
    })
    return {success: true}
}

export default updateNodeChannelAuthorizationHandler