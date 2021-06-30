import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import { isKacheryHubRequest } from '../src/kachery-js/types/kacheryHubTypes'
import googleVerifyIdToken from '../apiHelpers/common/googleVerifyIdToken'
import addAuthorizedNodeHandler from '../apiHelpers/kacheryHubRequestHandlers/addAuthorizedNode'
import addAuthorizedPasscodeHandler from '../apiHelpers/kacheryHubRequestHandlers/addAuthorizedPasscode'
import addChannelHandler from '../apiHelpers/kacheryHubRequestHandlers/addChannel'
import addNodeHandler from '../apiHelpers/kacheryHubRequestHandlers/addNode'
import addNodeChannelMembershipHandler from '../apiHelpers/kacheryHubRequestHandlers/addNodeChannelMembership'
import deleteChannelHandler from '../apiHelpers/kacheryHubRequestHandlers/deleteChannel'
import deleteNodeHandler from '../apiHelpers/kacheryHubRequestHandlers/deleteNode'
import deleteNodeChannelAuthorizationHandler from '../apiHelpers/kacheryHubRequestHandlers/deleteNodeChannelAuthorization'
import deleteNodeChannelMembershipHandler from '../apiHelpers/kacheryHubRequestHandlers/deleteNodeChannelMembership'
import deletePasscodeChannelAuthorizationHandler from '../apiHelpers/kacheryHubRequestHandlers/deletePasscodeChannelAuthorization'
import getChannelHandler from '../apiHelpers/kacheryHubRequestHandlers/getChannel'
import getChannelsForUserHandler from '../apiHelpers/kacheryHubRequestHandlers/getChannelsForUser'
import getNodeForUserHandler from '../apiHelpers/kacheryHubRequestHandlers/getNodeForUser'
import getNodesForUserHandler from '../apiHelpers/kacheryHubRequestHandlers/getNodesForUser'
import updateChannelPropertyHandler from '../apiHelpers/kacheryHubRequestHandlers/updateChannelProperty'
import updateNodeChannelAuthorizationHandler from '../apiHelpers/kacheryHubRequestHandlers/updateNodeChannelAuthorization'
import updateNodeChannelMembershipRequestHandler from '../apiHelpers/kacheryHubRequestHandlers/updateNodeChannelMembership'
import updatePasscodeChannelAuthorizationHandler from '../apiHelpers/kacheryHubRequestHandlers/updatePasscodeChannelAuthorization'

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
    const {userId, googleIdToken, reCaptchaToken} = auth
    if (!userId) throw Error('No auth user id')
    if (!googleIdToken) throw Error('No google id token')

    ;(async () => {
        const verifiedUserId = await googleVerifyIdToken(userId, googleIdToken)
        const verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined = await verifyReCaptcha(reCaptchaToken)
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
        else if (request.type === 'addAuthorizedPasscode') {
            return await addAuthorizedPasscodeHandler(request, verifiedUserId, verifiedReCaptchaInfo)
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
        else if (request.type === 'deletePasscodeChannelAuthorization') {
            return await deletePasscodeChannelAuthorizationHandler(request, verifiedUserId)
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
        else if (request.type === 'updatePasscodeChannelAuthorization') {
            return await updatePasscodeChannelAuthorizationHandler(request, verifiedUserId)
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