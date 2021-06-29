import { DeletePasscodeChannelAuthorizationRequest, PasscodeChannelAuthorization } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const deletePasscodeChannelAuthorizationHandler = async (request: DeletePasscodeChannelAuthorizationRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.channelName).get()
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
    if (!authorizedPasscodes.map(x => x.passcode).includes(request.passcode)) {
        throw Error('Authorized passcode not found')
    }
    await doc.ref.update({
        authorizedPasscodes: authorizedPasscodes.filter(x => (x.passcode !== request.passcode))
    })
    return {success: true}
}

export default deletePasscodeChannelAuthorizationHandler