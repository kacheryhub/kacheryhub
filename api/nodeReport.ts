import { VercelRequest, VercelResponse } from '@vercel/node'
import { NodeId, nowTimestamp, PublicKey, PublicKeyHex } from '../src/common/kacheryTypes/kacheryTypes'
import { isNodeReportRequest } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import verifySignature from './common/verifySignature'

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

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isNodeReportRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const body = request.body
        const signature = request.signature
        if (!verifySignature(body, signature, nodeIdToPublicKey(body.nodeId))) {
            throw Error('Invalid signature')
        }

        const db = firestoreDatabase()
        const nodesCollection = db.collection('nodes')
        const nodeResults = await nodesCollection
                .where('nodeId', '==', body.nodeId)
                .where('ownerId', '==', body.ownerId).get()
        if (nodeResults.docs.length === 0) {
            throw Error(`Node not found`)
        }
        if (nodeResults.docs.length > 1) {
            throw Error(`More than one node found`)
        }
        await nodeResults.docs[0].ref.update({
            lastNodeReport: body,
            lastNodeReportTimestamp: nowTimestamp()
        })
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}