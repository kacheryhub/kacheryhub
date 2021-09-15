import { DeleteChannelRequest } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserId } from '../../src/commonInterface/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const deleteChannelHandler = async (request: DeleteChannelRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection.where('channelName', '==', request.channelName).get()
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
    await doc.ref.update({deleted: true})
    return {success: true}
}

export default deleteChannelHandler