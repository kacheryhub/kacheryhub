import { AddNodeChannelMembershipRequest, NodeChannelMembership } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import { VerifiedReCaptchaInfo } from '../kacheryHub'

const addNodeChannelMembershipHandler = async (request: AddNodeChannelMembershipRequest, verifiedUserId: UserId, verifiedReCaptchaInfo: VerifiedReCaptchaInfo) => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
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
    const channelMemberships: NodeChannelMembership[] = doc.get('channelMemberships') || []
    if (channelMemberships.map(x => x.channelName).includes(request.channelName)) {
        throw Error('Already member of channel')
    }
    channelMemberships.push({
        nodeId: request.nodeId,
        channelName: request.channelName,
        roles: {
            downloadFiles: true,
            downloadFeeds: true,
            downloadTaskResults: true
        }
    })
    await doc.ref.update({
        channelMemberships: channelMemberships
    })
    return {success: true}
}

export default addNodeChannelMembershipHandler