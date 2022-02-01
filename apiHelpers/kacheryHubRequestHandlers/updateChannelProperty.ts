import axios from 'axios'
import { UserId } from '../../src/commonInterface/kacheryTypes'
import { isGoogleServiceAccountCredentials, UpdateChannelPropertyRequest } from '../../src/kacheryInterface/kacheryHubTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import isAdminUser from './isAdminUser'

const _bitwooderResourceRequest = async (req: any) => {
    const protocol = 'http'
    const endpointDomain = process.env.REACT_APP_BITWOODER_API_DOMAIN ?? 'bitwooder.net'
    const x = await axios.post(`${protocol}://${endpointDomain}/api/resource`, req)
    return x.data
}

type ResourceInfo = {
    resourceId: string,
    resourceType: string,
    bucketBaseUrl?: string
}

export const getBitwooderResourceInfoForKey = async (key: string): Promise<ResourceInfo> => {
    const req = {
        type: 'getResourceInfo',
        resourceKey: key
    }
    const resp = await _bitwooderResourceRequest(req)
    return resp.resourceInfo as ResourceInfo
}

const updateChannelPropertyHandler = async (request: UpdateChannelPropertyRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel with name "${request.channelName}" does not exist.`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`Unexpected: more than one channel with name ${request.channelName}`)
    }
    const doc = channelResults.docs[0]
    if ((verifiedUserId !== doc.get('ownerId')) && (!isAdminUser(verifiedUserId))) {
        throw Error('Not authorized')
    }
    if (request.propertyName === 'bitwooderResourceKey') {
        const bitwooderResourceKey = request.propertyValue
        const resourceInfo = await getBitwooderResourceInfoForKey(bitwooderResourceKey)
        await doc.ref.update({
            bitwooderResourceKey,
            bitwooderResourceId: resourceInfo.resourceId,
            bucketBaseUrl: resourceInfo.bucketBaseUrl || ''
        })
    }
    else if (request.propertyName === 'bucketUri') {
        await doc.ref.update({bucketUri: request.propertyValue})
    }
    else if (request.propertyName === 'ablyApiKey') {
        await doc.ref.update({ablyApiKey: request.propertyValue})
    }
    else if (request.propertyName === 'googleServiceAccountCredentials') {
        const cred = JSON.parse(request.propertyValue)
        if (!isGoogleServiceAccountCredentials(cred)) {
            throw Error('Invalid google service account credentials')
        }
        await doc.ref.update({googleServiceAccountCredentials: request.propertyValue})
    }
    else {
        throw Error('Unexpected property name')
    }
    return {success: true}
}

export default updateChannelPropertyHandler