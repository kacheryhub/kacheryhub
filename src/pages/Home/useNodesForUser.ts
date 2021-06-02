import { useCallback, useEffect, useRef, useState } from 'react'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import kacheryHubApiRequest from '../../common/kacheryHubApiRequest'
import { isArrayOf } from '../../common/kacheryTypes/kacheryTypes'
import { GetNodesForUserRequest, isNodeConfig, NodeConfig } from '../../common/types'

const useNodesForUser = (userId?: string | null) => {
    const nodesForUser = useRef<{[key: string]: NodeConfig[]}>({})
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c + 1))}, [])
    useEffect(() => {
        if (!userId) return
        ;(async () => {
            delete nodesForUser.current[userId]
            incrementUpdateCode()
            const req: GetNodesForUserRequest = {
                type: 'getNodesForUser',
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const nodes = await kacheryHubApiRequest(req)
            if (!isArrayOf(isNodeConfig)(nodes)) {
                console.warn('Invalid nodes', nodes)
                return
            }
            nodesForUser.current[userId] = nodes
            incrementUpdateCode()
        })()
    }, [userId, googleSignInClient, refreshCode, incrementUpdateCode])
    return {nodesForUser: userId ? nodesForUser.current[userId] || undefined : undefined, refreshNodesForUser: incrementRefreshCode}
}

export default useNodesForUser