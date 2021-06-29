import { Storage } from '@google-cloud/storage'
import { isGoogleServiceAccountCredentials } from '../../src/kachery-js/types/kacheryHubTypes'
import { CreateSignedSubfeedMessageUploadUrlRequestBody, CreateSignedSubfeedMessageUploadUrlResponse } from '../../src/kachery-js/types/kacheryNodeRequestTypes'
import { FeedId, NodeId, SubfeedHash, UrlString } from "../../src/kachery-js/types/kacheryTypes"
import bucketNameFromUri from '../common/bucketNameFromUri'
import generateV4UploadSignedUrl from '../common/generateV4UploadSignedUrl'
import loadChannelConfig, { loadNodeChannelAuthorization } from '../common/loadChannelConfig'

const createSignedSubfeedMessageUploadUrlHandler = async (request: CreateSignedSubfeedMessageUploadUrlRequestBody, verifiedNodeId: NodeId): Promise<CreateSignedSubfeedMessageUploadUrlResponse> => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }

    const { channelName, ownerId } = request
    const channelConfig = await loadChannelConfig({channelName})
    const bucketUri = channelConfig.bucketUri
    if (!bucketUri) {
        throw Error('No bucket uri for channel')
    }
    const bucketName = bucketNameFromUri(bucketUri)
    const {authorization} = await loadNodeChannelAuthorization({channelName, nodeId: verifiedNodeId, nodeOwnerId: ownerId})
    if (!authorization) {
        throw Error('Not authorized on this channel')
    }
    if (!authorization.permissions.provideFeeds) {
        throw Error('Not authorized to upload feeds on this channel')
    }
    const googleServiceAccountCredentials = channelConfig.googleServiceAccountCredentials
    if (!googleServiceAccountCredentials) {
        throw Error(`No google service credentials found for channel: ${request.channelName}`)
    }
    const googleCredentials = JSON.parse(channelConfig.googleServiceAccountCredentials || '{}')
    if (!isGoogleServiceAccountCredentials(googleCredentials)) {
        throw Error(`Invalid google credentials for channel: ${channelName}`)
    }
    const storage = new Storage({
        projectId: googleCredentials.project_id,
        credentials: {
            client_email: googleCredentials.client_email,
            private_key: googleCredentials.private_key
        }
    })
    const subfeedPath = getSubfeedPath(request.feedId, request.subfeedHash)
    const signedUrls: {[key: string]: UrlString} = {}
    for (let i = request.messageNumberRange[0]; i < request.messageNumberRange[1]; i++) {
        const fileName = `${subfeedPath}/${i}`
        const signedUrl = await generateV4UploadSignedUrl(storage, bucketName, fileName, null)
        signedUrls[i + ''] = signedUrl
    }
    {
        const fileName = `${subfeedPath}/subfeed.json`
        const signedUrl = await generateV4UploadSignedUrl(storage, bucketName, fileName, null)
        signedUrls['subfeedJson'] = signedUrl
    }
    
    return {signedUrls}
}

const getSubfeedPath = (feedId: FeedId, subfeedHash: SubfeedHash) => {
    const f = feedId.toString()
    const s = subfeedHash.toString()
    const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
    return subfeedPath
}

export default createSignedSubfeedMessageUploadUrlHandler