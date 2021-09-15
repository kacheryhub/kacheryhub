import { AddChannelRequest } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserId } from '../../src/commonInterface/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import { VerifiedReCaptchaInfo } from '../../api/kacheryHub'

const addChannelHandler = async (request: AddChannelRequest, verifiedUserId: UserId, verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined) => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
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