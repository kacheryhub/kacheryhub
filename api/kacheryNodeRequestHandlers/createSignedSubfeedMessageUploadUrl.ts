import { Storage } from '@google-cloud/storage'
import { isChannelConfig, isGoogleServiceAccountCredentials } from '../../src/common/types/kacheryHubTypes'
import { CreateSignedSubfeedMessageUploadUrlRequestBody, CreateSignedSubfeedMessageUploadUrlResponse } from '../../src/common/types/kacheryNodeRequestTypes'
import { FeedId, NodeId, SubfeedHash, UrlPath, UrlString, urlString } from "../../src/common/types/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"
import generateV4UploadSignedUrl from '../common/generateV4UploadSignedUrl'

const createSignedSubfeedMessageUploadUrlHandler = async (request: CreateSignedSubfeedMessageUploadUrlRequestBody, verifiedNodeId: NodeId): Promise<CreateSignedSubfeedMessageUploadUrlResponse> => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }

    const db = firestoreDatabase()
    const channelName = request.channelName
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
            .where('channelName', '==', channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel not found: ${channelName}`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`More than one channel record found: ${channelName}`)
    }
    const channelConfig = channelResults.docs[0].data()
    if (!isChannelConfig(channelConfig)) {
        console.warn(channelConfig)
        throw Error('Unexpected, not a valid channel config')
    }
    const bucketUri = channelConfig.bucketUri
    if (!bucketUri) {
        throw Error('No bucket uri for channel')
    }
    const bucketName = bucketNameFromUri(bucketUri)
    const authorizedNode = channelConfig.authorizedNodes.filter(n => (n.nodeId === request.nodeId))[0]
    if (!authorizedNode) {
        throw Error('Not authorized on this channel')
    }
    if (!authorizedNode.permissions.provideFeeds) {
        throw Error('Not authorized to upload feeds on this channel')
    }
    const googleServiceAccountCredentials = channelConfig.googleServiceAccountCredentials
    if (!googleServiceAccountCredentials) {
        throw Error(`No google service credentials found for channel: ${request.channelName}`)
    }
    // create the signed url!
    // const signedUrl = await create
    const googleCredentials = JSON.parse(channelConfig.googleServiceAccountCredentials)
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

const bucketNameFromUri = (bucketUri: string) => {
    if (!bucketUri.startsWith('gs://')) throw Error(`Invalid bucket uri: ${bucketUri}`)
    const a = bucketUri.split('/')
    return a[2]
}

const getSubfeedPath = (feedId: FeedId, subfeedHash: SubfeedHash) => {
    const f = feedId.toString()
    const s = subfeedHash.toString()
    const subfeedPath = `feeds/${f[0]}${f[1]}/${f[2]}${f[3]}/${f[4]}${f[5]}/${f}/subfeeds/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
    return subfeedPath
}

export default createSignedSubfeedMessageUploadUrlHandler