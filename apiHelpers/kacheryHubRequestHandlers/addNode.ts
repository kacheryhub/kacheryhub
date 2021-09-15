import { AddNodeRequest } from '../../src/kacheryInterface/kacheryHubTypes'
import { UserId } from '../../src/commonInterface/kacheryTypes'
import firestoreDatabase from '../common/firestoreDatabase'
import { VerifiedReCaptchaInfo } from '../../api/kacheryHub'

const addNodeHandler = async (request: AddNodeRequest, verifiedUserId: UserId, verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined) => {
    if (verifiedUserId !== request.node.ownerId) {
        throw Error('Not authorized')
    }
    if (!verifiedReCaptchaInfo) {
        if (process.env.REACT_APP_RECAPTCHA_KEY) {
            throw Error('Recaptcha info is not verified')
        }
    }

    const db = firestoreDatabase()
    const nodesCollection = db.collection('nodes')
    const nodeResults = await nodesCollection
            .where('nodeId', '==', request.node.nodeId)
            .where('ownerId', '==', verifiedUserId).get()
    if (nodeResults.docs.length > 0) {
        throw Error(`Node with ID "${request.node.nodeId}" already exists for this owner.`)
    }
    await nodesCollection.add(request.node)
    return {success: true}
}

export default addNodeHandler