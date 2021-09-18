import useGoogleSignInClient from 'commonComponents/googleSignIn/useGoogleSignInClient'
import { isArrayOf, UserId } from 'commonInterface/kacheryTypes'
import kacheryHubApiRequest from 'kacheryInterface/kacheryHubApiRequest'
import { ChannelConfig, GetChannelsForUserRequest, isChannelConfig } from 'kacheryInterface/kacheryHubTypes'
import { useCallback, useEffect, useRef, useState } from 'react'

const useChannelsForUser = (userId?: UserId | null) => {
    const channelsForUser = useRef<{[key: string]: ChannelConfig[]}>({})
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c + 1))}, [])
    useEffect(() => {
        if (!userId) return
        ;(async () => {
            delete channelsForUser.current[userId.toString()]
            incrementUpdateCode()
            const req: GetChannelsForUserRequest = {
                type: 'getChannelsForUser',
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const channels = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isArrayOf(isChannelConfig)(channels)) {
                console.warn('Invalid channels', channels)
                return
            }
            channelsForUser.current[userId.toString()] = channels
            incrementUpdateCode()
        })()
    }, [userId, googleSignInClient, refreshCode, incrementUpdateCode])
    return {channelsForUser: userId ? channelsForUser.current[userId.toString()] || undefined : undefined, refreshChannelsForUser: incrementRefreshCode}
}

export default useChannelsForUser