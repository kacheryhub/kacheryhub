import axios from "axios"
import { KacheryHubRequest } from "../kachery-js/types/kacheryHubTypes"

const kacheryHubApiRequest = async (request: KacheryHubRequest) => {
    try {
        const x = await axios.post('/api/kacheryHub', request)
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