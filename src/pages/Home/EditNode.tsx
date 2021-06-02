import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import formatTime from '../../common/formatTime'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { NodeId } from '../../common/kacheryTypes/kacheryTypes'
import { AddNodeChannelMembershipRequest, DeleteNodeChannelMembershipRequest, GetNodeForUserRequest, isNodeConfig, NodeChannelAuthorization, NodeChannelMembership, NodeConfig, UpdateNodeChannelMembershipRequest } from '../../common/types'
import EditNodeChannelMemberships from './EditNodeChannelMemberships'
import {updateNodeChannelAuthorization} from './EditChannel'

type Props = {
    nodeId: NodeId
}

const addNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, nodeId: NodeId, channelName: string) => {
    const req: AddNodeChannelMembershipRequest = {
        nodeId,
        channelName,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/addNodeChannelMembership', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const updateNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, membership: NodeChannelMembership) => {
    const req: UpdateNodeChannelMembershipRequest = {
        membership,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/updateNodeChannelMembership', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const deleteNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, channelName: string, nodeId: NodeId) => {
    const req: DeleteNodeChannelMembershipRequest = {
        channelName,
        nodeId,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/deleteNodeChannelMembership', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const EditNode: FunctionComponent<Props> = ({nodeId}) => {
    const [nodeConfig, setNodeConfig] = useState<NodeConfig | undefined>(undefined)
    const googleSignInClient = useGoogleSignInClient()
    const userId = googleSignInClient?.userId
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => setRefreshCode(c => (c + 1)), [])
    const [errorMessage, setErrorMessage] = useState<string>('')
    const node = useMemo(() => {
        if (!userId) return undefined
        if (!nodeConfig) return undefined
        if (nodeConfig.ownerId !== userId) {
            return undefined
        }
        if (nodeConfig.nodeId !== nodeId) return undefined
        return nodeConfig
    }, [nodeId, nodeConfig, userId])

    const handleAddNodeChannelMembership = useCallback((channelName: string, nodeId: NodeId) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await addNodeChannelMembership(googleSignInClient, nodeId, channelName)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode])

    const handleUpdateNodeChannelMembership = useCallback((a: NodeChannelMembership) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await updateNodeChannelMembership(googleSignInClient, a)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode])

    const handleDeleteNodeChannelMembership = useCallback((channelName: string, nodeId: NodeId) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await deleteNodeChannelMembership(googleSignInClient, channelName, nodeId)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode])

    const handleUpdateNodeChannelAuthorization = useCallback((a: NodeChannelAuthorization) => {
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
            const req: GetNodeForUserRequest = {
                nodeId,
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const x = (await axios.post('/api/getNodeForUser', req)).data
            if (!isNodeConfig(x)) {
                console.warn('Invalid node', x)
                return
            }
            setNodeConfig(x)
        })()
    }, [nodeId, userId, googleSignInClient, refreshCode])

    const tableRows = useMemo(() => {
        const ret: {key: string, label: string | JSX.Element, value: any}[] = []
        ret.push({
            key: 'nodeId',
            label: <span style={{fontWeight: 'bold'}}>Node:</span>,
            value: <span style={{fontWeight: 'bold'}}>{nodeId}</span>
        })
        ret.push({
            key: 'label',
            label: 'Label:',
            value: <span>{node?.lastNodeReport ? node?.lastNodeReport.nodeLabel : ''}</span>
        })
        ret.push({
            key: 'owner',
            label: 'Owner:',
            value: <span>{node?.lastNodeReport ? node?.lastNodeReport.ownerId : ''}</span>
        })
        ret.push({
            key: 'lastUpdate',
            label: 'Last update:',
            value: <span>{node?.lastNodeReportTimestamp ? formatTime(new Date(Number(node?.lastNodeReportTimestamp))) : ''}</span>
        })
        return ret
    }, [nodeId, node])
    return (
        <div className="EditNode">
            <h2>Node configuration</h2>
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
                node && (
                    <EditNodeChannelMemberships
                        node={node}
                        onAddNodeChannelMembership={handleAddNodeChannelMembership}
                        onUpdateNodeChannelMembership={handleUpdateNodeChannelMembership}
                        onUpdateNodeChannelAuthorization={handleUpdateNodeChannelAuthorization}
                        onDeleteNodeChannelMembership={handleDeleteNodeChannelMembership}
                    />
                )
            }
            {
                errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
            }
        </div>
    )
}

export default EditNode