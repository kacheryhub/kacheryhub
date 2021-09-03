import { useSignedIn } from "common/googleSignIn/GoogleSignIn";
import kacheryHubApiRequest from "common/kacheryHubApiRequest";
import { GetUserConfigRequest, isGetUserConfigResponse } from "kachery-js/types/kacheryHubTypes";
import { UserConfig } from "kachery-js/types/kacheryTypes";
import { useEffect, useState } from "react";

const useUserConfig = () => {
    const {userId, googleIdToken} = useSignedIn()
    const [userConfig, setUserConfig] = useState<UserConfig | undefined>(undefined)
    useEffect(() => {
        setUserConfig(undefined)
        ;(async () => {
            if (!userId) return
            const req: GetUserConfigRequest = {
                type: 'getUserConfig',
                userId,
                auth: {
                    userId,
                    googleIdToken
                }
            }
            const x = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isGetUserConfigResponse(x)) return
            setUserConfig(x.userConfig)
        })()
    }, [userId, googleIdToken])
    return userConfig
}

export default useUserConfig