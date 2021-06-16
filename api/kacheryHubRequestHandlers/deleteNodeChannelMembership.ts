import { DeleteNodeChannelMembershipRequest, NodeChannelMembership } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'


const deleteNodeChannelMembershipHandler = async (request: DeleteNodeChannelMembershipRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
        .where('nodeId', '==', request.nodeId)
        .where('ownerId', '==', verifiedUserId).get()
    if (nodeResults.docs.length === 0) {
        throw Error(`Node with ID "${request.nodeId}" does not exist.`)
    }
    if (nodeResults.docs.length > 1) {
        throw Error(`Unexpected: more than one node with ID ${request.nodeId}`)
    }
    const doc = nodeResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    const memberships: NodeChannelMembership[] = doc.get('channelMemberships') || []
    if (!memberships.map(x => x.channelName).includes(request.channelName)) {
        throw Error('Channel membership not found')
    }
    await doc.ref.update({
        channelMemberships: memberships.filter(x => (x.channelName !== request.channelName))
    })
    return {success: true}
}

export default deleteNodeChannelMembershipHandler