import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { isNodeId, NodeId } from '../../common/kacheryTypes/kacheryTypes'
import { AddAuthorizedNodeRequest, ChannelConfig, GetChannelRequest, isChannelConfig, NodeChannelAuthorization, UpdateNodeChannelAuthorizationRequest } from '../../common/types'
import EditChannelAuthorizedNodes from './EditChannelAuthorizedNodes'

type Props = {
    channelName: string
}

const addAuthorizedNode = async (googleSignInClient: GoogleSignInClient, channelName: string, nodeId: NodeId) => {
    const req: AddAuthorizedNodeRequest = {
        channelName,
        nodeId,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/addAuthorizedNode', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

export const updateNodeChannelAuthorization = async (googleSignInClient: GoogleSignInClient, authorization: NodeChannelAuthorization) => {
    const req: UpdateNodeChannelAuthorizationRequest = {
        authorization,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/updateNodeChannelAuthorization', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const EditChannel: FunctionComponent<Props> = ({channelName}) => {
    const [channelConfig, setChannelConfig] = useState<ChannelConfig | undefined>(undefined)
    const googleSignInClient = useGoogleSignInClient()
    const userId = googleSignInClient?.userId
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => setRefreshCode(c => (c + 1)), [])
    const [errorMessage, setErrorMessage] = useState<string>('')
    const channel = useMemo(() => {
        if (!channelName) return undefined
        if (!channelConfig) return undefined
        if (channelConfig.ownerId !== userId) {
            return undefined
        }
        if (channelConfig.channelName !== channelName) return undefined
        return channelConfig
    }, [channelName, channelConfig, userId])
    
    const handleAddAuthorizedNode = useCallback((channelName: string, nodeId: string) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!isNodeId(nodeId)) {
            setErrorMessage('Invalid node ID')
            return
        }
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await addAuthorizedNode(googleSignInClient, channelName, nodeId)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode])

    const handleUpdateAuthorization = useCallback((a: NodeChannelAuthorization) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await updateNodeChannelAuthorization(googleSignInClient, a)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode])

    useEffect(() => {
        if (!userId) return undefined
        ;(async () => {
            const req: GetChannelRequest = {
                channelName,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const x = (await axios.post('/api/getChannel', req)).data
            if (!isChannelConfig(x)) {
                console.warn('Invalid channel', x)
                return
            }
            setChannelConfig(x)
        })()
    }, [channelName, userId, googleSignInClient, refreshCode])

    const tableRows = useMemo(() => {
        const ret: {key: string, label: string | JSX.Element, value: any}[] = []
        ret.push({
            key: 'channelName',
            label: <span style={{fontWeight: 'bold'}}>Channel:</span>,
            value: <span style={{fontWeight: 'bold'}}>{channelName}</span>
        })
        ret.push({
            key: 'owner',
            label: 'Owner:',
            value: <span>{channel?.ownerId || ''}</span>
        })
        return ret
    }, [channelName, channel])
    return (
        <div className="EditChannel">
            <h2>Channel configuration</h2>
            <div style={{maxWidth: 600}}>
                <Table>
                    <TableBody>
                        {
                            tableRows.map(r => (
                                <TableRow key={r.key}>
                                    <TableCell key="label">{r.label}</TableCell>
                                    <TableCell key="value">{r.value}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
            {
                channel && (
                    <EditChannelAuthorizedNodes channel={channel} onAddAuthorizedNode={handleAddAuthorizedNode} onUpdateAuthorization={handleUpdateAuthorization} />
                )
            }
            {
                errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
            }
        </div>
    )
}

export default EditChannel