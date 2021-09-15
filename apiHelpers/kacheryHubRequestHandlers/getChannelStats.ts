import { GetChannelStatsRequest, GetChannelStatsResponse } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserId } from '../../src/commonInterface/kacheryTypes'
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