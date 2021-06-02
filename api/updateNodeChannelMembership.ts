import { VercelRequest, VercelResponse } from '@vercel/node'
import { isUpdateNodeChannelMembershipRequest, NodeChannelMembership } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isUpdateNodeChannelMembershipRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)

        const db = firestoreDatabase()
        const nodesCollection = db.collection('nodes')
        const nodeResults = await nodesCollection
            .where('nodeId', '==', request.membership.nodeId)
            .where('ownerId', '==', verifiedUserId).get()
        if (nodeResults.docs.length === 0) {
            throw Error(`Node with ID "${request.membership.nodeId}" does not exist.`)
        }
        if (nodeResults.docs.length > 1) {
            throw Error(`Unexpected: more than one node with ID ${request.membership.nodeId}`)
        }
        const doc = nodeResults.docs[0]
        if (verifiedUserId !== doc.get('ownerId')) {
            throw Error('Not authorized')
        }
        const memberships: NodeChannelMembership[] = doc.get('channelMemberships') || []
        if (!memberships.map(x => x.channelName).includes(request.membership.channelName)) {
            throw Error('Channel membership not found')
        }
        await doc.ref.update({
            channelMemberships: memberships.map(x => (x.channelName === request.membership.channelName ? request.membership : x))
        })
        return {success: true}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}