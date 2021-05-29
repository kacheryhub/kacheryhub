import { VercelRequest, VercelResponse } from '@vercel/node'
import { isString, _validateObject } from '../src/common/kacheryTypes/kacheryTypes'
import fetchChannelConfig from './common/fetchChannelConfig'


type GetChannelConfigRequest = {
    channelName: string
}
const isGetChannelConfigRequest = (x: any): x is GetChannelConfigRequest => {
    return _validateObject(x, {
        channelConfig: isString
    })
}

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: request} = req
    if (!isGetChannelConfigRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    const {channelName} = request

    ;(async () => {
        const channelConfig = await fetchChannelConfig(channelName)
        return channelConfig
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}