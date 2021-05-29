import { Storage } from '@google-cloud/storage'
import { VercelRequest, VercelResponse } from '@vercel/node'
import ChannelsConfig, { isChannelsConfig } from '../src/common/ChannelsConfig'
import { isString, _validateObject } from '../src/common/kacheryTypes/kacheryTypes'
import googleBucketName from './common/googleBucketName'
import googleConfig from './common/googleConfig'
import googleVerifyIdToken from './common/googleVerifyIdToken'
import uploadJsonToBucket from './common/uploadJsonToBucket'

type SetChannelsConfigRequest = {
    googleIdToken: string
    config: ChannelsConfig
}
const isSetChannelsConfigRequest = (x: any): x is SetChannelsConfigRequest => {
    return _validateObject(x, {
        googleIdToken: isString,
        config: isChannelsConfig
    })
}
module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isSetChannelsConfigRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const userId = await googleVerifyIdToken(request.googleIdToken)
        if (userId !== process.env.REACT_APP_ADMIN_GOOGLE_ID) {
            console.warn(userId, process.env.REACT_APP_ADMIN_GOOGLE_ID)
            throw Error('Not google admin')
        }
        const storage = new Storage(googleConfig)
        const bucket = storage.bucket(googleBucketName);
        await uploadJsonToBucket(bucket, 'kachery-channels.json', JSON.stringify(request.config))
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}