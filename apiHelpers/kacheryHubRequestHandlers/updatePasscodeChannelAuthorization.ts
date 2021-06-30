import { PasscodeChannelAuthorization, UpdatePasscodeChannelAuthorizationRequest } from '../../src/kachery-js/types/kacheryHubTypes'
import { UserId } from '../../src/kachery-js/types/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'

const updatePasscodeChannelAuthorizationHandler = async (request: UpdatePasscodeChannelAuthorizationRequest, verifiedUserId: UserId) => {
    const db = firestoreDatabase()
    const channelsCollection = db.collection('channels')
    const channelResults = await channelsCollection
        .where('channelName', '==', request.authorization.channelName).get()
    if (channelResults.docs.length === 0) {
        throw Error(`Channel with name "${request.authorization.channelName}" does not exist.`)
    }
    if (channelResults.docs.length > 1) {
        throw Error(`Unexpected: more than one channel with name ${request.authorization.channelName}`)
    }
    const doc = channelResults.docs[0]
    if (verifiedUserId !== doc.get('ownerId')) {
        throw Error('Not authorized')
    }
    const authorizedPasscodes: PasscodeChannelAuthorization[] = doc.get('authorizedPasscodes') || []
    if (!authorizedPasscodes.map(x => x.passcode).includes(request.authorization.passcode)) {
        throw Error('Authorized passcode not found')
    }
    await doc.ref.update({
        authorizedPasscodes: authorizedPasscodes.map(x => (x.passcode === request.authorization.passcode ? request.authorization : x))
    })
    return {success: true}
}

export default updatePasscodeChannelAuthorizationHandler