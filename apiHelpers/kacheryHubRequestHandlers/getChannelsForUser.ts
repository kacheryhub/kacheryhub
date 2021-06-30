import { ChannelConfig, GetChannelsForUserRequest, isChannelConfig } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import hideChannelSecrets from '../common/hideChannelSecrets'

const getChannelsForUserHandler = async (request: GetChannelsForUserRequest, verifiedUserId: UserId) => {
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection.where('ownerId', '==', request.userId).get()
    const ret: ChannelConfig[] = []
    for (let doc of channelResults.docs) {
        const x = doc.data()
        if (isChannelConfig(x)) {
            if (!x.deleted) {
                ret.push(hideChannelSecrets(x, {hidePasscodes: false}))
            }
        }
        else {
            console.warn('Not a valid channel config', x)
        }
    }
    return ret
}

export default getChannelsForUserHandler