import { NodeChannelMembership, UpdateNodeChannelMembershipRequest } from '../../src/common/types/kacheryHubTypes'
import { UserId } from '../../src/common/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const updateNodeChannelMembershipRequestHandler = async (request: UpdateNodeChannelMembershipRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
        .where('nodeId', '==', request.membership.nodeId)
        .where('ownerId', '==', verifiedUserId).get()
    if (nodeResults.docs.length === 0) {
        throw Error(`Node with ID "${request.membership.nodeId}" does not exist.`)
    }
    if (nodeResults.docs.length > 1) {
        throw Error(`Unexpected: more than one node with ID ${request.membership.nodeId}`)
    }
    const doc = nodeResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    const memberships: NodeChannelMembership[] = doc.get('channelMemberships') || []
    if (!memberships.map(x => x.channelName).includes(request.membership.channelName)) {
        throw Error('Channel membership not found')
    }
    await doc.ref.update({
        channelMemberships: memberships.map(x => (x.channelName === request.membership.channelName ? request.membership : x))
    })
    return {success: true}
}

export default updateNodeChannelMembershipRequestHandler