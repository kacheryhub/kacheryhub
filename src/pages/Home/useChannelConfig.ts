import useGoogleSignInClient from "commonComponents/googleSignIn/useGoogleSignInClient"
import kacheryHubApiRequest from "kacheryInterface/kacheryHubApiRequest"
import { ChannelConfig, GetChannelRequest, isChannelConfig } from "kacheryInterface/kacheryHubTypes"
import { ChannelName } from "commonInterface/kacheryTypes"
import { useCallback, useEffect, useState } from "react"

const useChannelConfig = (channelName: ChannelName | undefined) => {
    const [channelConfig, setChannelConfig] = useState<ChannelConfig | undefined>(undefined)
    const [channelConfigStatusMessage, setChannelConfigStatusMessage] = useState<string>('')
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    useEffect(() => {
        if (!channelName) return
        ;(async () => {
            setChannelConfigStatusMessage(`Loading config for channel: ${channelName}`)
            const req: GetChannelRequest = {
                type: 'getChannel',
                channelName,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const x = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isChannelConfig(x)) {
                setChannelConfigStatusMessage(`Invalid response for getChannel, for channel: ${channelName}`)
                return
            }
            setChannelConfig(x)
        })().catch((err) => {
            setChannelConfigStatusMessage(err.message)
        })
    }, [channelName, googleSignInClient, refreshCode])

    const refreshChannelConfig = useCallback(() => {
        setRefreshCode((c) => (c + 1))
    }, [])

    return {
        channelConfig,
        channelConfigStatusMessage,
        refreshChannelConfig
    }
}

export default useChannelConfig