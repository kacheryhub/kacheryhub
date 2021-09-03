import { ChannelConfig, GetAllChannelsRequest, isChannelConfig } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import hideChannelSecrets from '../common/hideChannelSecrets'
import isAdminUser from './isAdminUser'

const getAllChannels = async (request: GetAllChannelsRequest, verifiedUserId: UserId) => {
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    if (!isAdminUser(verifiedUserId)) {
        throw Error('Not an admin user')
    }

    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection.get()
    const ret: ChannelConfig[] = []
    for (let doc of channelResults.docs) {
        const x = doc.data()
        if (!x.deleted) {
            if (isChannelConfig(x)) {
                if (!x.deleted) {
                    ret.push(hideChannelSecrets(x, {hidePasscodes: false}))
                }
            }
            else {
                console.warn('Not a valid channel config', x)
            }
        }
    }
    return ret
}

export default getAllChannels