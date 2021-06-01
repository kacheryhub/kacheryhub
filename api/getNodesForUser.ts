import { VercelRequest, VercelResponse } from '@vercel/node'
import { isGetNodesForUserRequest, isNodeConfig, NodeConfig } from '../src/common/types'
import firestoreDatabase from './common/firestoreDatabase'
import googleVerifyIdToken from './common/googleVerifyIdToken'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isGetNodesForUserRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        const auth = request.auth
        if (!auth.userId) throw Error('No auth user id')
        if (!auth.googleIdToken) throw Error('No google id token')
        const verifiedUserId = await googleVerifyIdToken(auth.userId, auth.googleIdToken)
        if (verifiedUserId !== request.userId) {
            throw Error('Not authorized')
        }

        const db = firestoreDatabase()
        const nodesCollection = db.collection('nodes')
        const nodeResults = await nodesCollection.where('ownerId', '==', request.userId).get()
        const ret: NodeConfig[] = []
        for (let doc of nodeResults.docs) {
            const x = doc.data()
            if (isNodeConfig(x)) {
                if (!x.deleted) {
                    ret.push(x)
                }
            }
            else {
                console.warn(JSON.stringify(x, null, 4))
                console.warn('Not a valid node config')
            }
        }
        return ret
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(404).send(`Error: ${error.message}`)
    })
}