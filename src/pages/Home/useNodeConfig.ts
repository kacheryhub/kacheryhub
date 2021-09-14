import useGoogleSignInClient from "common/googleSignIn/useGoogleSignInClient"
import kacheryHubApiRequest from "common/kacheryHubApiRequest"
import { GetNodeForUserRequest, isGetNodeForUserResponse, NodeConfig } from "kachery-js/types/kacheryHubTypes"
import { NodeId } from "kachery-js/types/kacheryTypes"
import { useCallback, useEffect, useState } from "react"

const useNodeConfig = (nodeId: NodeId | undefined) => {
    const [nodeConfig, setNodeConfig] = useState<NodeConfig | undefined>(undefined)
    const [nodeConfigStatusMessage, setNodeConfigStatusMessage] = useState<string>('')
    const googleSignInClient = useGoogleSignInClient()
    const userId = googleSignInClient?.userId
    const [refreshCode, setRefreshCode] = useState<number>(0)
    useEffect(() => {
        if (!userId) return
        if (!nodeId) return
        ;(async () => {
            setNodeConfigStatusMessage(`Loading config for node: ${nodeId}`)
            const req: GetNodeForUserRequest = {
                type: 'getNodeForUser',
                nodeId,
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const x = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isGetNodeForUserResponse(x)) {
                console.warn(x)
                console.warn('Invalid response for getNodeForUser', x)
                return
            }
            if (x.found) {
                if (!x.nodeConfig) throw Error('Unexpected: no nodeConfig')
                setNodeConfig(x.nodeConfig)
            }
            else {
                setNodeConfigStatusMessage(`Node not found for user ${userId}: ${nodeId}`)
            }
        })().catch((err) => {
            setNodeConfigStatusMessage(err.message)
        })
    }, [nodeId, userId, googleSignInClient, refreshCode])

    const refreshNodeConfig = useCallback(() => {
        setRefreshCode((c) => (c + 1))
    }, [])

    return {
        nodeConfig,
        nodeConfigStatusMessage,
        refreshNodeConfig
    }
}

export default useNodeConfig