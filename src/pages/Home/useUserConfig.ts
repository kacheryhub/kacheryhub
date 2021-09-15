import { useSignedIn } from "commonInterface/googleSignIn/GoogleSignIn";
import kacheryHubApiRequest from "kacheryInterface/kacheryHubApiRequest";
import { GetUserConfigRequest, isGetUserConfigResponse } from "kacheryInterface/kacheryHubTypes";
import { UserConfig } from "commonInterface/kacheryTypes";
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