import { VercelRequest, VercelResponse } from '@vercel/node'
import { hexToPublicKey, verifySignature } from '../src/commonInterface/crypto/signatures'
import { isKacheryNodeRequest } from '../src/kacheryInterface/kacheryNodeRequestTypes'
import { ChannelName, JSONValue, nodeIdToPublicKeyHex } from '../src/commonInterface/kacheryTypes'
import createSignedFileUploadUrlHandler from '../apiHelpers/kacheryNodeRequestHandlers/createSignedFileUploadUrl'
import createSignedSubfeedMessageUploadUrlHandler from '../apiHelpers/kacheryNodeRequestHandlers/createSignedSubfeedMessageUploadUrl'
import createSignedTaskResultUploadUrlHandler from '../apiHelpers/kacheryNodeRequestHandlers/createSignedTaskResultUploadUrl'
import getChannelConfigHandler from '../apiHelpers/kacheryNodeRequestHandlers/getChannelConfig'
import getNodeConfigHandler from '../apiHelpers/kacheryNodeRequestHandlers/getNodeConfig'
import getPubsubAuthForChannelHandler from '../apiHelpers/kacheryNodeRequestHandlers/getPubsubAuthForChannel'
import reportHandler from '../apiHelpers/kacheryNodeRequestHandlers/report'
import logMessageToChannel from '../apiHelpers/common/logMessageToChannel'
import { statsReportFileUpload, statsReportNodeRequest, statsReportNodeRequestError, statsReportTaskResultUpload, statsReportUploadFeedMessages } from '../apiHelpers/common/stats'
import getBitwooderCertForChannelHandler from '../apiHelpers/kacheryNodeRequestHandlers/getBitwooderCertForChannel'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isKacheryNodeRequest(request)) {
        console.warn('Invalid request', request)
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    let channelName: ChannelName | undefined = undefined

    const body = request.body
    ;(async () => {
        const signature = request.signature
        if (!await verifySignature(body as any as JSONValue, hexToPublicKey(nodeIdToPublicKeyHex(request.nodeId)), signature)) {
            throw Error('Invalid signature')
        }
        const verifiedNodeId = request.nodeId

        await statsReportNodeRequest({type: body.type, nodeId: verifiedNodeId.toString(), channelName: body['channelName'] || undefined})
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
        else if (body.type === 'getBitwooderCertForChannel') {
            channelName = body.channelName
            return await getBitwooderCertForChannelHandler(body, verifiedNodeId)
        }
        else if (body.type === 'getPubsubAuthForChannel') {
            channelName = body.channelName
            return await getPubsubAuthForChannelHandler(body, verifiedNodeId)
        }
        else if (body.type === 'createSignedFileUploadUrl') {
            channelName = body.channelName
            const ret = await createSignedFileUploadUrlHandler(body, verifiedNodeId)
            await statsReportFileUpload({nodeId: verifiedNodeId.toString(), channelName: body.channelName.toString(), size: Number(body.size)})
            return ret
        }
        else if (body.type === 'createSignedSubfeedMessageUploadUrl') {
            channelName = body.channelName
            const ret = await createSignedSubfeedMessageUploadUrlHandler(body, verifiedNodeId)
            await statsReportUploadFeedMessages({nodeId: verifiedNodeId.toString(), channelName: body.channelName.toString(), numMessages: 1})
            return ret
        }
        else if (body.type === 'createSignedTaskResultUploadUrl') {
            channelName = body.channelName
            const ret = await createSignedTaskResultUploadUrlHandler(body, verifiedNodeId)
            await statsReportTaskResultUpload({nodeId: verifiedNodeId.toString(), channelName: body.channelName.toString(), size: Number(body.size)})
            return ret
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
        // const logMessage = {
        //     type: 'kacheryhub-node-request-error',
        //     request,
        //     errorMessage: error.message
        // } as any as JSONValue
        console.warn(error.message)
        statsReportNodeRequestError({type: body.type, nodeId: request.nodeId.toString(), channelName: body['channelName']}).then(() => {
            // if (channelName) {
            //     logMessageToChannel(channelName, logMessage)
            // }
            res.status(404).send(`Error: ${error.message}`)
        }).catch(() => {
            console.warn('Unable to report node request error.')
            res.status(404).send(`Error: ${error.message}`)
        })
    })
}