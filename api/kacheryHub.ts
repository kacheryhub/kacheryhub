import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import { isKacheryHubRequest } from '../src/kachery-js/types/kacheryHubTypes'
import googleVerifyIdToken from './common/googleVerifyIdToken'
import addAuthorizedNodeHandler from './kacheryHubRequestHandlers/addAuthorizedNode'
import addChannelHandler from './kacheryHubRequestHandlers/addChannel'
import addNodeHandler from './kacheryHubRequestHandlers/addNode'
import addNodeChannelMembershipHandler from './kacheryHubRequestHandlers/addNodeChannelMembership'
import deleteChannelHandler from './kacheryHubRequestHandlers/deleteChannel'
import deleteNodeHandler from './kacheryHubRequestHandlers/deleteNode'
import deleteNodeChannelAuthorizationHandler from './kacheryHubRequestHandlers/deleteNodeChannelAuthorization'
import deleteNodeChannelMembershipHandler from './kacheryHubRequestHandlers/deleteNodeChannelMembership'
import getChannelHandler from './kacheryHubRequestHandlers/getChannel'
import getChannelsForUserHandler from './kacheryHubRequestHandlers/getChannelsForUser'
import getNodeForUserHandler from './kacheryHubRequestHandlers/getNodeForUser'
import getNodesForUserHandler from './kacheryHubRequestHandlers/getNodesForUser'
import updateChannelPropertyHandler from './kacheryHubRequestHandlers/updateChannelProperty'
import updateNodeChannelAuthorizationHandler from './kacheryHubRequestHandlers/updateNodeChannelAuthorization'
import updateNodeChannelMembershipRequestHandler from './kacheryHubRequestHandlers/updateNodeChannelMembership'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

const verifyReCaptcha = async (token: string | undefined) => {
    if (!RECAPTCHA_SECRET_KEY) return undefined
    if (!token) return undefined

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    console.info(url)
    const x = await axios.post(url)
    return x.data
}

export type VerifiedReCaptchaInfo = {
    success: boolean,
    challenge_ts: string,
    hostname: string,
    score: number,
    action: string
}

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isKacheryHubRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }
    const auth = request.auth
    if (!auth.userId) throw Error('No auth user id')
    if (!auth.googleIdToken) throw Error('No google id token')

    ;(async () => {
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)
        const verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined = await verifyReCaptcha(auth.reCaptchaToken)
        if (verifiedReCaptchaInfo) {
            if (!verifiedReCaptchaInfo.success) {
                throw Error('Error verifying reCaptcha token')
            }
            if (verifiedReCaptchaInfo.score < 0.4) {
                throw Error(`reCaptcha score is too low: ${verifiedReCaptchaInfo.score}`)
            }
        }
        if (request.type === 'addAuthorizedNode') {
            return await addAuthorizedNodeHandler(request, verifiedUserId, verifiedReCaptchaInfo)
        }
        else if (request.type === 'addChannel') {
            return await addChannelHandler(request, verifiedUserId, verifiedReCaptchaInfo)
        }
        else if (request.type === 'addNode') {
            return await addNodeHandler(request, verifiedUserId, verifiedReCaptchaInfo)
        }
        else if (request.type === 'addNodeChannelMembership') {
            return await addNodeChannelMembershipHandler(request, verifiedUserId, verifiedReCaptchaInfo)
        }
        else if (request.type === 'deleteChannel') {
            return await deleteChannelHandler(request, verifiedUserId)
        }
        else if (request.type === 'deleteNode') {
            return await deleteNodeHandler(request, verifiedUserId)
        }
        else if (request.type === 'deleteNodeChannelAuthorization') {
            return await deleteNodeChannelAuthorizationHandler(request, verifiedUserId)
        }
        else if (request.type === 'deleteNodeChannelMembership') {
            return await deleteNodeChannelMembershipHandler(request, verifiedUserId)
        }
        else if (request.type === 'getChannel') {
            return await getChannelHandler(request, verifiedUserId)
        }
        else if (request.type === 'getChannelsForUser') {
            return await getChannelsForUserHandler(request, verifiedUserId)
        }
        else if (request.type === 'getNodeForUser') {
            return await getNodeForUserHandler(request, verifiedUserId)
        }
        else if (request.type === 'getNodesForUser') {
            return await getNodesForUserHandler(request, verifiedUserId)
        }
        else if (request.type === 'updateChannelProperty') {
            return await updateChannelPropertyHandler(request, verifiedUserId)
        }
        else if (request.type === 'updateNodeChannelAuthorization') {
            return await updateNodeChannelAuthorizationHandler(request, verifiedUserId)
        }
        else if (request.type === 'updateNodeChannelMembership') {
            return await updateNodeChannelMembershipRequestHandler(request, verifiedUserId)
        }
        else {
            throw Error(`Unexpected request type: ${request.type}`)
        }
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}