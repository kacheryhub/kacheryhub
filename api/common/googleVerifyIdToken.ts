import {OAuth2Client} from 'google-auth-library'
import { isUserId, UserId } from '../../src/kachery-js/types/kacheryTypes';

const client = new OAuth2Client(process.env.REACT_APP_CLIENT_ID);
const googleVerifyIdToken = async (userId: UserId, token: string) => {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_CLIENT_ID
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  })
  const payload = ticket.getPayload()
  const userEmail = payload['email']
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  if (userEmail !== userId.toString()) {
    console.warn(userEmail, userId)
    throw Error('Mismatch between auth user id and verified user id')
  }
  if (!isUserId(userEmail)) throw Error(`Not a valid user id: ${userEmail}`)
  return userEmail
}

export default googleVerifyIdToken