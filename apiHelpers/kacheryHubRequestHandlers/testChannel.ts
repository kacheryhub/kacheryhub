import { ChannelConfig, TestChannelRequest, TestChannelResponse } from '../../src/kacheryInterface/kacheryHubTypes'
import { errorMessage, ErrorMessage, UserId } from '../../src/commonInterface/kacheryTypes'
import loadChannelConfig from '../common/loadChannelConfig'

const testChannelHandler = async (request: TestChannelRequest, verifiedUserId: UserId): Promise<TestChannelResponse> => {
    const { channelName } = request
    const channelConfig = await loadChannelConfig({channelName})
    const ret: TestChannelResponse = {
        bucketTest: await doTest(channelConfig, bucketTest),
        pubSubTest: await doTest(channelConfig, pubSubTest)
    }
    return ret
}

const doTest = async (channelConfig: ChannelConfig, test: (ChannelConfig: ChannelConfig) => Promise<void>): Promise<{success: boolean, errorMessage?: ErrorMessage}> => {
    try {
        await test(channelConfig)
    }
    catch(err) {
        return {
            success: false,
            errorMessage: errorMessage(err.message)
        }
    }
    return {success: true}
}

const bucketTest = async (channelConfig: ChannelConfig) => {
    throw Error('Not yet implemented')
}

const pubSubTest = async (channelConfig: ChannelConfig) => {
    throw Error('Not yet implemented')
}

export default testChannelHandler