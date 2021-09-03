import { GetChannelStatsRequest, GetChannelStatsResponse } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const getChannelStatsHandler = async (request: GetChannelStatsRequest, verifiedUserId: UserId): Promise<GetChannelStatsResponse> => {
    const { channelName } = request
    const db = firestoreDatabase()
    const channelStatsCollection = db.collection('channelStats')
    const ref = channelStatsCollection.doc(channelName.toString())
    try {
        const doc = await ref.get()
        const docData = doc.data()
        return {
            channelStats: docData
        }
    }
    catch {
        return {
            channelStats: {}
        }
    }
}

export default getChannelStatsHandler