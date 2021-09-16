import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { AddNodeChannelMembershipRequest, DeleteNodeChannelMembershipRequest, NodeChannelAuthorization, NodeChannelMembership, UpdateNodeChannelMembershipRequest } from 'kacheryInterface/kacheryHubTypes'
import { ChannelName, NodeId } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import formatTime from 'commonInterface/util/formatTime'
import GoogleSignInClient from 'commonComponents/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from 'commonComponents/googleSignIn/useGoogleSignInClient'
import kacheryHubApiRequest from 'kacheryInterface/kacheryHubApiRequest'
import CommonNodeActions from './CommonNodeActions'
import { updateNodeChannelAuthorization } from './EditChannel'
import EditNodeChannelMemberships from './EditNodeChannelMemberships'
import useNodeConfig from './useNodeConfig'

type Props = {
    nodeId: NodeId
}

export const addNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, nodeId: NodeId, channelName: ChannelName) => {
    const req: AddNodeChannelMembershipRequest = {
        type: 'addNodeChannelMembership',
        nodeId,
        channelName,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: true})
}

export const updateNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, membership: NodeChannelMembership) => {
    const req: UpdateNodeChannelMembershipRequest = {
        type: 'updateNodeChannelMembership',
        membership,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: false})
}

const deleteNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, channelName: ChannelName, nodeId: NodeId) => {
    const req: DeleteNodeChannelMembershipRequest = {
        type: 'deleteNodeChannelMembership',
        channelName,
        nodeId,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: false})
}

const EditNode: FunctionComponent<Props> = ({nodeId}) => {
    const {nodeConfig, nodeConfigStatusMessage, refreshNodeConfig} = useNodeConfig(nodeId)
    const googleSignInClient = useGoogleSignInClient()
    const userId = googleSignInClient?.userId
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

    const handleAddNodeChannelMembership = useCallback((channelName: ChannelName, nodeId: NodeId) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await addNodeChannelMembership(googleSignInClient, nodeId, channelName)
                refreshNodeConfig()
            }
            catch(err: any) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, refreshNodeConfig])

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
                refreshNodeConfig()
            }
            catch(err: any) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, refreshNodeConfig])

    const handleDeleteNodeChannelMembership = useCallback((channelName: ChannelName, nodeId: NodeId) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await deleteNodeChannelMembership(googleSignInClient, channelName, nodeId)
                refreshNodeConfig()
            }
            catch(err: any) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, refreshNodeConfig])

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
                refreshNodeConfig()
            }
            catch(err: any) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, refreshNodeConfig])

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
            {
                node ? (
                    <span>
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
                        <h2>Common actions</h2>
                        <CommonNodeActions
                            nodeId={node.nodeId}
                        />
                        <EditNodeChannelMemberships
                            node={node}
                            onAddNodeChannelMembership={handleAddNodeChannelMembership}
                            onUpdateNodeChannelMembership={handleUpdateNodeChannelMembership}
                            onUpdateNodeChannelAuthorization={handleUpdateNodeChannelAuthorization}
                            onDeleteNodeChannelMembership={handleDeleteNodeChannelMembership}
                        />
                    </span>
                ) : (
                    <span>{nodeConfigStatusMessage}</span>
                )
            }
            
            {
                errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
            }
        </div>
    )
}

export default EditNode