import { AddAuthorizedPasscodeRequest, PasscodeChannelAuthorization } from "../../src/kachery-js/types/kacheryHubTypes"
import { UserId } from "../../src/kachery-js/types/kacheryTypes"
import firestoreDatabase from "../common/firestoreDatabase"
import { VerifiedReCaptchaInfo } from "../../api/kacheryHub"

const addAuthorizedPasscodeHandler = async (request: AddAuthorizedPasscodeRequest, verifiedUserId: UserId, verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined) => {
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.channelName)
        .where('ownerId', '==', verifiedUserId).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel with name "${request.channelName}" does not exist.`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`Unexpected: more than one channel with name ${request.channelName}`)
    }
    const doc = channelResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    const authorizedPasscodes: PasscodeChannelAuthorization[] = doc.get('authorizedPasscodes') || []
    if (authorizedPasscodes.map(x => x.passcode).includes(request.passcode)) {
        throw Error('Passcode is already authorized')
    }
    authorizedPasscodes.push({
        channelName: request.channelName,
        passcode: request.passcode,
        permissions: {}
    })
    await doc.ref.update({
        authorizedPasscodes: authorizedPasscodes
    })
    return {success: true}
}

export default addAuthorizedPasscodeHandler