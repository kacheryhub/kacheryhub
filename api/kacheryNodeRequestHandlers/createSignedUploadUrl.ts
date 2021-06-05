import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import { isChannelConfig, isGoogleServiceAccountCredentials } from '../../src/common/types/kacheryHubTypes'
import { CreateSignedUploadUrlRequestBody, CreateSignedUploadUrlResponse } from "../../src/common/types/kacheryNodeRequestTypes"
import { ByteCount, NodeId, urlString, UrlString } from "../../src/common/types/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"
import getNodeConfigHandler from './getNodeConfig'

const createSignedUploadUrlHandler = async (request: CreateSignedUploadUrlRequestBody, verifiedNodeId: NodeId): Promise<CreateSignedUploadUrlResponse> => {
    if (request.nodeId !== verifiedNodeId) {
        throw Error('Mismatch between node ID and verified node ID')
    }

    const bucketName = bucketNameFromUri(request.bucketUri)
    const size = request.size
    const s = request.sha1
    const fileName = `sha1/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`

    const db = firestoreDatabase()
    const nodeConfig = await getNodeConfigHandler({
        type: 'getNodeConfig',
        nodeId: request.nodeId,
        ownerId: request.ownerId
    }, verifiedNodeId)

    let channelNameCandidates: string[] = []
    for (let cm of nodeConfig.channelMemberships) {
        if ((cm.authorization.permissions.provideFiles) && (cm.channelBucketUri === request.bucketUri)) {
            channelNameCandidates.push(cm.channelName)
        }
    }
    if (channelNameCandidates.length === 0) {
        throw Error(`No authorized channel found for bucket uri: ${request.bucketUri}`)
    }
    for (let channelName of channelNameCandidates) {
        const channelsCollection = db.collection('channels')
        const channelResults = await channelsCollection
                .where('channelName', '==', channelName).get()
        if (channelResults.docs.length === 0) {
            throw Error(`Unexpected, Channel not found: ${channelName}`)
        }
        if (channelResults.docs.length > 1) {
            throw Error(`Unexpected, more than one channel record found: ${channelName}`)
        }
        const channelConfig = channelResults.docs[0].data()
        if (!isChannelConfig(channelConfig)) {
            console.warn(channelConfig)
            throw Error('Unexpected, not a valid channel config')
        }
        const authorizedNode = channelConfig.authorizedNodes.filter(n => (n.nodeId === request.nodeId))[0]
        if (!authorizedNode) {
            throw Error('Unexpected, not authorized on this channel')
        }
        if (channelConfig.googleServiceAccountCredentials) {
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
            const signedUrl = await generateV4UploadSignedUrl(storage, bucketName, fileName, size)
            return {signedUrl}
        }
    }
    throw Error(`No google service credentials found for bucket: ${request.bucketUri}`)
}

const generateV4UploadSignedUrl = async (storage: Storage, bucketName: string, fileName: string, size: ByteCount): Promise<UrlString> => {
    // These options will allow temporary uploading of the file with outgoing
    // Content-Type: application/octet-stream header.
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'application/octet-stream',
      extensionHeaders: {
        //   'X-Upload-Content-Length': Number(size)
      }
    };
  
    // Get a v4 signed URL for uploading file
    const [url] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options)
    
    return urlString(url)
  
    // console.log('Generated PUT signed URL:');
    // console.log(url);
    // console.log('You can use this URL with any user agent, for example:');
    // console.log(
    //   "curl -X PUT -H 'Content-Type: application/octet-stream' " +
    //     `--upload-file my-file '${url}'`
    // );
}

const bucketNameFromUri = (bucketUri: string) => {
    if (!bucketUri.startsWith('gs://')) throw Error(`Invalid bucket uri: ${bucketUri}`)
    const a = bucketUri.split('/')
    return a[2]
}

export default createSignedUploadUrlHandler