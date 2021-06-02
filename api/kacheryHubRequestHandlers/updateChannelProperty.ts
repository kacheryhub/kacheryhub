import { NodeChannelAuthorization, UpdateChannelPropertyRequest } from '../../src/common/types'
import firestoreDatabase from '../common/firestoreDatabase'

const updateChannelPropertyHandler = async (request: UpdateChannelPropertyRequest, verifiedUserId: string) => {
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
    if (request.propertyName === 'bucketUri') {
        await doc.ref.update({bucketUri: request.propertyValue})
    }
    else if (request.propertyName === 'ablyApiKey') {
        await doc.ref.update({ablyApiKey: request.propertyValue})
    }
    else if (request.propertyName === 'googleServiceAccountCredentials') {
        await doc.ref.update({googleServiceAccountCredentials: request.propertyValue})
    }
    else {
        throw Error('Unexpected property name')
    }
    return {success: true}
}

export default updateChannelPropertyHandler