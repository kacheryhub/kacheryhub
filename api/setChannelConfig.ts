import { Storage } from '@google-cloud/storage'
import { VercelRequest, VercelResponse } from '@vercel/node'
import ChannelConfig, { isChannelConfig } from '../src/common/ChannelConfig'
import { isString, _validateObject } from '../src/common/kacheryTypes/kacheryTypes'
import fetchChannelsConfig from './common/fetchChannelsConfig'
import googleBucketName from './common/googleBucketName'
import googleConfig from './common/googleConfig'
import googleVerifyIdToken from './common/googleVerifyIdToken'
import uploadJsonToBucket from './common/uploadJsonToBucket'

type SetChannelsConfigRequest = {
    googleIdToken: string
    channelName: string
    config: ChannelConfig
}
const isSetChannelsConfigRequest = (x: any): x is SetChannelsConfigRequest => {
    return _validateObject(x, {
        googleIdToken: isString,
        channelName: isString,
        config: isChannelConfig
    })
}



module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isSetChannelsConfigRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    const {googleIdToken, channelName, config} = request

    ;(async () => {
        const userId = await googleVerifyIdToken(googleIdToken)
        const channelsConfig = await fetchChannelsConfig()
        const x = channelsConfig.channels.filter(c => (c.channelName === channelName))[0]
        if (!x) throw Error(`Channel not found: ${channelName}`)
        if (userId !== x.adminId) {
            throw Error('Not admin for this channel')
        }
        const storage = new Storage(googleConfig)
        const bucket = storage.bucket(googleBucketName);
        await uploadJsonToBucket(bucket, `kachery-channels/${channelName}.json`, JSON.stringify(config))
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}