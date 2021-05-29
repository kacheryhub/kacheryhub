import {Firestore} from '@google-cloud/firestore'
import {isGoogleServiceAccountCredentials} from '../../src/common/types'

const firestoreDatabase = () => {
    const googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS)
    if (!isGoogleServiceAccountCredentials(googleCredentials)) {
        throw Error('Invalid google credentials.')
    }
    return new Firestore({
        projectId: googleCredentials.project_id,
        credentials: {
            client_email: googleCredentials.client_email,
            private_key: googleCredentials.private_key
        }
    })
}

export default firestoreDatabase