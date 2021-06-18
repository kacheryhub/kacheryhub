import { VercelRequest, VercelResponse } from '@vercel/node'
import { JSONValue } from '../../surfaceview3/src/kachery-js/types/kacheryTypes'
import { hexToPublicKey, verifySignature } from '../src/kachery-js/crypto/signatures'
import { isKacheryNodeRequest } from '../src/kachery-js/types/kacheryNodeRequestTypes'
import { nodeIdToPublicKeyHex } from '../src/kachery-js/types/kacheryTypes'
import createSignedFileUploadUrlHandler from './kacheryNodeRequestHandlers/createSignedFileUploadUrl'
import createSignedSubfeedMessageUploadUrlHandler from './kacheryNodeRequestHandlers/createSignedSubfeedMessageUploadUrl'
import createSignedTaskResultUploadUrlHandler from './kacheryNodeRequestHandlers/createSignedTaskResultUploadUrl'
import getChannelConfigHandler from './kacheryNodeRequestHandlers/getChannelConfig'
import getNodeConfigHandler from './kacheryNodeRequestHandlers/getNodeConfig'
import getPubsubAuthForChannelHandler from './kacheryNodeRequestHandlers/getPubsubAuthForChannel'
import reportHandler from './kacheryNodeRequestHandlers/report'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isKacheryNodeRequest(request)) {
        console.warn('Invalid request', request)
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const body = request.body
        const signature = request.signature
        if (!await verifySignature(body as any as JSONValue, hexToPublicKey(nodeIdToPublicKeyHex(request.nodeId)), signature)) {
            throw Error('Invalid signature')
        }
        const verifiedNodeId = request.nodeId

        if (body.type === 'report') {
            return await reportHandler(body, verifiedNodeId)
        }
        else if (body.type === 'getNodeConfig') {
            return await getNodeConfigHandler(body, verifiedNodeId)
        }
        else if (body.type === 'getChannelConfig') {
            return await getChannelConfigHandler(body, verifiedNodeId)
        }
        else if (body.type === 'getPubsubAuthForChannel') {
            return await getPubsubAuthForChannelHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedFileUploadUrl') {
            return await createSignedFileUploadUrlHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedSubfeedMessageUploadUrl') {
            return await createSignedSubfeedMessageUploadUrlHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedTaskResultUploadUrl') {
            return await createSignedTaskResultUploadUrlHandler(body, verifiedNodeId)
        }
        else {
            throw Error(`Unexpected request type (kacheryNode): ${body["type"]}`)
        }
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}