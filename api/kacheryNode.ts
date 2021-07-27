import { VercelRequest, VercelResponse } from '@vercel/node'
import { hexToPublicKey, verifySignature } from '../src/kachery-js/crypto/signatures'
import { isKacheryNodeRequest } from '../src/kachery-js/types/kacheryNodeRequestTypes'
import { ChannelName, JSONValue, nodeIdToPublicKeyHex } from '../src/kachery-js/types/kacheryTypes'
import createSignedFileUploadUrlHandler from '../apiHelpers/kacheryNodeRequestHandlers/createSignedFileUploadUrl'
import createSignedSubfeedMessageUploadUrlHandler from '../apiHelpers/kacheryNodeRequestHandlers/createSignedSubfeedMessageUploadUrl'
import createSignedTaskResultUploadUrlHandler from '../apiHelpers/kacheryNodeRequestHandlers/createSignedTaskResultUploadUrl'
import getChannelConfigHandler from '../apiHelpers/kacheryNodeRequestHandlers/getChannelConfig'
import getNodeConfigHandler from '../apiHelpers/kacheryNodeRequestHandlers/getNodeConfig'
import getPubsubAuthForChannelHandler from '../apiHelpers/kacheryNodeRequestHandlers/getPubsubAuthForChannel'
import reportHandler from '../apiHelpers/kacheryNodeRequestHandlers/report'
import logMessageToChannel from '../apiHelpers/common/logMessageToChannel'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isKacheryNodeRequest(request)) {
        console.warn('Invalid request', request)
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    let channelName: ChannelName | undefined = undefined

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
            channelName = body.channelName
            return await getChannelConfigHandler(body, verifiedNodeId)
        }
        else if (body.type === 'getPubsubAuthForChannel') {
            channelName = body.channelName
            return await getPubsubAuthForChannelHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedFileUploadUrl') {
            channelName = body.channelName
            return await createSignedFileUploadUrlHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedSubfeedMessageUploadUrl') {
            channelName = body.channelName
            return await createSignedSubfeedMessageUploadUrlHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedTaskResultUploadUrl') {
            channelName = body.channelName
            return await createSignedTaskResultUploadUrlHandler(body, verifiedNodeId)
        }
        else {
            throw Error(`Unexpected request type (kacheryNode): ${body["type"]}`)
        }
    })().then((result) => {
        const logMessage = {
            type: 'kacheryhub-node-request',
            request,
            response: result
        } as any as JSONValue
        if (channelName) {
            logMessageToChannel(channelName, logMessage)
        }
        res.json(result)
    }).catch((error: Error) => {
        const logMessage = {
            type: 'kacheryhub-node-request-error',
            request,
            errorMessage: error.message
        } as any as JSONValue
        if (channelName) {
            logMessageToChannel(channelName, logMessage)
        }
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}