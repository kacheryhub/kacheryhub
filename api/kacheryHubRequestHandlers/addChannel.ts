import { AddChannelRequest } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'

const addChannelHandler = async (request: AddChannelRequest, verifiedUserId: string) => {
    if (verifiedUserId !== request.channel.ownerId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection.where('channelName', '==', request.channel.channelName).get()
    if (channelResults.docs.length > 0) {
        if ((channelResults.docs.length === 1) && (channelResults.docs[0].get('ownerId') === request.channel.ownerId) && (channelResults.docs[0].get('deleted'))) {
            await channelResults.docs[0].ref.delete()
        }
        else {
            throw Error(`Channel with name "${request.channel.channelName}" already exists.`)
        }
    }
    await channelsCollection.add(request.channel)
    return {success: true}
}

export default addChannelHandler