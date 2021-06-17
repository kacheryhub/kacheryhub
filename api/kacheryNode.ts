import { VercelRequest, VercelResponse } from '@vercel/node'
import { NodeId, PublicKey, PublicKeyHex } from '../src/kachery-js/types/kacheryTypes'
import getNodeConfigHandler from './kacheryNodeRequestHandlers/getNodeConfig'
import getChannelConfigHandler from './kacheryNodeRequestHandlers/getChannelConfig'
import reportHandler from './kacheryNodeRequestHandlers/report'
import {verifySignature} from '../src/kachery-js/types/crypto_util'
import { isKacheryNodeRequest } from '../src/kachery-js/types/kacheryNodeRequestTypes'
import getPubsubAuthForChannelHandler from './kacheryNodeRequestHandlers/getPubsubAuthForChannel'
import createSignedFileUploadUrlHandler from './kacheryNodeRequestHandlers/createSignedFileUploadUrl'
import createSignedSubfeedMessageUploadUrlHandler from './kacheryNodeRequestHandlers/createSignedSubfeedMessageUploadUrl'
import createSignedTaskResultUploadUrlHandler from './kacheryNodeRequestHandlers/createSignedTaskResultUploadUrl'

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
        if (!await verifySignature(body, signature, nodeIdToPublicKey(request.nodeId))) {
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

const ed25519PubKeyPrefix = "302a300506032b6570032100";
export const hexToPublicKey = (x: PublicKeyHex): PublicKey => {
    /* istanbul ignore next */
    if (!x) {
        throw Error('Error in hexToPublicKey. Input is empty.');
    }
    return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(ed25519PubKeyPrefix + x, 'hex').toString('base64')}\n-----END PUBLIC KEY-----\n` as any as PublicKey;
}
export const nodeIdToPublicKey = (nodeId: NodeId): PublicKey => {
    return hexToPublicKey(nodeId.toString() as any as PublicKeyHex);
}