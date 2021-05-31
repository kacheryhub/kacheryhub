import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { isArrayOf, NodeId } from '../../common/kacheryTypes/kacheryTypes'
import { GetNodesForUserRequest, isNodeConfig, NodeConfig } from '../../common/types'
import NodesTable from './NodesTable'

type Props = {
}

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
            const req: GetNodesForUserRequest = {
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const nodes = (await axios.post('/api/getNodesForUser', req)).data
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

const NodeListSection: FunctionComponent<Props> = () => {
    const googleSignInClient = useGoogleSignInClient()
    const {nodesForUser} = useNodesForUser(googleSignInClient?.userId)
    const [status, ] = useState<'ready' | 'processing'>('ready')
    const [errorMessage,] = useState<string>('')

    const handleForgetNode = useCallback((nodeId: NodeId) => {
        // todo
    }, [])

    return (
        <div>
            <h4>Your nodes</h4>
            <p>
                These are nodes hosted by you; each is represented by a kachery daemon running on a computer.
                You can configure which channels these nodes belong to in which roles.
            </p>
            {
                (nodesForUser && nodesForUser.length === 0) && (
                    <div>You do not have any nodes</div>
                )
            }
            {
                <NodesTable nodes={nodesForUser || []} onForgetNode={(status === 'ready') ? handleForgetNode : undefined} />
            }
            {
                errorMessage && (
                    <span style={{color: 'red'}}>{errorMessage}</span>
                )
            }
        </div>
    )
}

export default NodeListSection