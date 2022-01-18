import { GetChannelBucketBaseUrlRequest, GetChannelBucketBaseUrlResponse } from "../api/getChannelBucketBaseUrl"
import loadChannelConfig from "./common/loadChannelConfig"

const getChannelBucketBaseUrlHandler = async (request: GetChannelBucketBaseUrlRequest): Promise<GetChannelBucketBaseUrlResponse> => {
    const { channelName } = request
    const response = await loadChannelConfig({channelName})
    const url = response.bucketBaseUrl
    if (!url) {
        throw Error('Channel does not have bucket base url')
    }
    return {
        url
    }
}

export default getChannelBucketBaseUrlHandler