import { Storage } from '@google-cloud/storage'
import { isGoogleServiceAccountCredentials } from '../../src/kachery-js/types/kacheryHubTypes'
import { CreateSignedFileUploadUrlRequestBody, CreateSignedFileUploadUrlResponse } from "../../src/kachery-js/types/kacheryNodeRequestTypes"
import { NodeId } from "../../src/kachery-js/types/kacheryTypes"
import bucketNameFromUri from '../common/bucketNameFromUri'
import generateV4UploadSignedUrl from '../common/generateV4UploadSignedUrl'
import loadChannelConfig from '../common/loadChannelConfig'

const createSignedFileUploadUrlHandler = async (request: CreateSignedFileUploadUrlRequestBody, verifiedNodeId: NodeId): Promise<CreateSignedFileUploadUrlResponse> => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }

    const { channelName } = request
    const channelConfig = await loadChannelConfig({channelName})

    const bucketUri = channelConfig.bucketUri
    if (!bucketUri) {
        throw Error('No bucket uri for channel')
    }
    const bucketName = bucketNameFromUri(bucketUri)
    const authorizedNode = (channelConfig.authorizedNodes || []).filter(n => (n.nodeId === request.nodeId))[0]
    if (!authorizedNode) {
        throw Error('Not authorized on this channel')
    }
    if (!authorizedNode.permissions.provideFiles) {
        throw Error('Not authorized to upload files on this channel')
    }
    const googleServiceAccountCredentials = channelConfig.googleServiceAccountCredentials
    if (!googleServiceAccountCredentials) {
        throw Error(`No google service credentials found for channel: ${request.channelName}`)
    }
    // create the signed url!
    // const signedUrl = await create
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
    const size = request.size
    const s = request.sha1
    const fileName = `sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`
    const signedUrl = await generateV4UploadSignedUrl(storage, bucketName, fileName, size)
    return {signedUrl}
}

export default createSignedFileUploadUrlHandler