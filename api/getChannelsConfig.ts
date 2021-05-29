import { VercelRequest, VercelResponse } from '@vercel/node'
import { _validateObject } from '../src/common/kacheryTypes/kacheryTypes'
import fetchChannelsConfig from './common/fetchChannelsConfig'


type GetChannelsConfigRequest = {

}
const isGetChannelsConfigRequest = (x: any): x is GetChannelsConfigRequest => {
    return _validateObject(x, {
    })
}

module.exports = (req: VercelRequest, res: VercelResponse) => {
    const {body: request} = req
    if (!isGetChannelsConfigRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const channelsConfig = await fetchChannelsConfig()
        return channelsConfig
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}