import {Firestore} from '@google-cloud/firestore'
import {isGoogleServiceAccountCredentials} from '../../src/common/types'

let db: Firestore | null = null

const firestoreDatabase = () => {
    if (!db) {
        const googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS)
        if (!isGoogleServiceAccountCredentials(googleCredentials)) {
            throw Error('Invalid google credentials.')
        }
        db = new Firestore({
            projectId: googleCredentials.project_id,
            credentials: {
                client_email: googleCredentials.client_email,
                private_key: googleCredentials.private_key
            }
        })
    }
    return db
}

export default firestoreDatabase