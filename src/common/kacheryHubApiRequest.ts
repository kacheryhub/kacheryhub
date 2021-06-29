import axios from "axios"
import { KacheryHubRequest } from "kachery-js/types/kacheryHubTypes"
import { getReCaptchaToken } from "./reCaptcha"

const kacheryHubApiRequest = async (request: KacheryHubRequest, opts: {reCaptcha: boolean}) => {
    let request2: KacheryHubRequest = request
    if (opts.reCaptcha) {
        const reCaptchaToken = await getReCaptchaToken()
        request2 = {...request, auth: {...request.auth, reCaptchaToken}}
    }
    try {
        const x = await axios.post('/api/kacheryHub', request2)
        return x.data
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

export default kacheryHubApiRequest