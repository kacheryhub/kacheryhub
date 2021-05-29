import urlFromUri from '../../src/common/urlFromUri'
import googleBucketName from './googleBucketName'

const channelConfigUrl = (channelName: string) => {
    const uri = `gs://${googleBucketName}/kachery-channels/${channelName}.json`
    return urlFromUri(uri)
}

export default channelConfigUrl