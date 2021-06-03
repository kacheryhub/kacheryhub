import { VercelRequest, VercelResponse } from '@vercel/node'
import { NodeId, PublicKey, PublicKeyHex } from '../src/common/kacheryTypes/kacheryTypes'
import getNodeConfigHandler from './kacheryNodeRequestHandlers/getNodeConfig'
import reportHandler from './kacheryNodeRequestHandlers/report'
import {verifySignature} from '../src/common/kacheryTypes/crypto_util'
import { isKacheryNodeRequest } from '../src/common/kacheryNodeRequestTypes'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isKacheryNodeRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }
    const body = request.body
    const signature = request.signature
    if (!verifySignature(body, signature, nodeIdToPublicKey(request.nodeId))) {
        throw Error('Invalid signature')
    }
    const verifiedNodeId = request.nodeId

    ;(async () => {
        if (body.type === 'report') {
            return await reportHandler(body, verifiedNodeId)
        }
        else if (body.type === 'getNodeConfig') {
            return await getNodeConfigHandler(body, verifiedNodeId)
        }
        else {
            throw Error(`Unexpected request type`)
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