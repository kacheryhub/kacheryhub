import { VercelRequest, VercelResponse } from '@vercel/node'
import { isAddNodeRequest } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isAddNodeRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)
        if (verifiedUserId !== request.node.ownerId) {
            throw Error('Not authorized')
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
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}