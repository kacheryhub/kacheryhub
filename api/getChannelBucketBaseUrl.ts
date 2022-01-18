import { VercelRequest, VercelResponse } from '@vercel/node'
import getChannelBucketBaseUrlHandler from '../apiHelpers/getChannelBucketBaseUrlHandler'
import { ChannelName, isChannelName, _validateObject } from '../src/commonInterface/kacheryTypes'

export type GetChannelBucketBaseUrlRequest = {
    channelName: ChannelName
}

const isGetChannelBucketBaseUrlRequest = (x: any): x is GetChannelBucketBaseUrlRequest => {
    return _validateObject(x, {
        channelName: isChannelName
    })
}

export type GetChannelBucketBaseUrlResponse = {
    url: string
}

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isGetChannelBucketBaseUrlRequest(request)) {
        console.warn('Invalid request', request)
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        return await getChannelBucketBaseUrlHandler(request)
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        // const logMessage = {
        //     type: 'kacheryhub-node-request-error',
        //     request,
        //     errorMessage: error.message
        // } as any as JSONValue
        console.warn(error.message)
    })
}