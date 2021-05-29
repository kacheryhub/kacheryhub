import urlFromUri from '../../src/common/urlFromUri'
import googleBucketName from './googleBucketName'

const channelsConfigUri = `gs://${googleBucketName}/kachery-channels.json`
const channelsConfigUrl = urlFromUri(channelsConfigUri)

export default channelsConfigUrl