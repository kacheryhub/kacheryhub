import { useCallback, useEffect, useRef, useState } from 'react'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import kacheryHubApiRequest from '../../common/kacheryHubApiRequest'
import { isArrayOf, UserId } from 'kachery-js/types/kacheryTypes'
import { GetNodesForUserRequest, isNodeConfig, NodeConfig } from 'kachery-js/types/kacheryHubTypes'

const useNodesForUser = (userId?: UserId | null) => {
    const nodesForUser = useRef<{[key: string]: NodeConfig[]}>({})
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c + 1))}, [])
    useEffect(() => {
        if (!userId) return
        ;(async () => {
            delete nodesForUser.current[userId.toString()]
            incrementUpdateCode()
            const req: GetNodesForUserRequest = {
                type: 'getNodesForUser',
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const nodes = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isArrayOf(isNodeConfig)(nodes)) {
                console.warn('Invalid nodes', nodes)
                return
            }
            nodesForUser.current[userId.toString()] = nodes
            incrementUpdateCode()
        })()
    }, [userId, googleSignInClient, refreshCode, incrementUpdateCode])
    return {nodesForUser: userId ? nodesForUser.current[userId.toString()] || undefined : undefined, refreshNodesForUser: incrementRefreshCode}
}

export default useNodesForUser