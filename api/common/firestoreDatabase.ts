import {Firestore} from '@google-cloud/firestore'

const firestoreDatabase = () => {
    return new Firestore({
        projectId: '',
        credentials: {
            client_email: '',
            private_key: ''
        }
    })
}

export default firestoreDatabase