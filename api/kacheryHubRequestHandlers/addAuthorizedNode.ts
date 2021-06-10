import { AddAuthorizedNodeRequest, NodeChannelAuthorization } from "../../src/common/types/kacheryHubTypes"
import { UserId } from "../../src/common/types/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"

const addAuthorizedNodeHandler = async (request: AddAuthorizedNodeRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.channelName)
        .where('ownerId', '==', verifiedUserId).get()
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
    if (authorizedNodes.map(x => x.nodeId).includes(request.nodeId)) {
        throw Error('Node is already authorized')
    }
    authorizedNodes.push({
        channelName: request.channelName,
        nodeId: request.nodeId,
        permissions: {}
    })
    await doc.ref.update({
        authorizedNodes: authorizedNodes
    })
    return {success: true}
}

export default addAuthorizedNodeHandler