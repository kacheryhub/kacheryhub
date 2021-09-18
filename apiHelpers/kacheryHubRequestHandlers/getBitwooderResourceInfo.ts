import { GetBitwooderResourceInfoRequest, NodeChannelMembership, UpdateNodeChannelMembershipRequest } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserId } from '../../src/commonInterface/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import { VerifiedReCaptchaInfo } from '../../api/kacheryHub'
import { getBitwooderResourceInfoForKey } from './updateChannelProperty'

const getBitwooderResourceInfoHandler = async (request: GetBitwooderResourceInfoRequest, verifiedUserId: UserId, verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined) => {
    if (!verifiedUserId) {
        throw Error('No verified user ID')
    }
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }

    const resourceInfo = await getBitwooderResourceInfoForKey(request.resourceKey)
    return resourceInfo
}

export default getBitwooderResourceInfoHandler