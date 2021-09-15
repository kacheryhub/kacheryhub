import { GetUserConfigRequest, GetUserConfigResponse } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserConfig, UserId } from '../../src/commonInterface/kacheryTypes'
import isAdminUser from './isAdminUser'

const getUserConfigHandler = async (request: GetUserConfigRequest, verifiedUserId: UserId): Promise<GetUserConfigResponse> => {
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }
    const userConfig: UserConfig = {
        admin: isAdminUser(request.userId)
    }
    return {
        userConfig
    }
}

export default getUserConfigHandler