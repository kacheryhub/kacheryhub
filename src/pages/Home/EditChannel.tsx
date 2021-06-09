import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import kacheryHubApiRequest from '../../common/kacheryHubApiRequest'
import { ChannelName, isNodeId, NodeId } from '../../common/types/kacheryTypes'
import { AddAuthorizedNodeRequest, ChannelConfig, DeleteNodeChannelAuthorizationRequest, GetChannelRequest, isChannelConfig, NodeChannelAuthorization, UpdateChannelPropertyRequest, UpdateNodeChannelAuthorizationRequest } from '../../common/types/kacheryHubTypes'
import EditChannelAuthorizedNodes from './EditChannelAuthorizedNodes'
import EditString from './EditString'

type Props = {
    channelName: ChannelName
}

const addAuthorizedNode = async (googleSignInClient: GoogleSignInClient, channelName: ChannelName, nodeId: NodeId) => {
    const req: AddAuthorizedNodeRequest = {
        type: 'addAuthorizedNode',
        channelName,
        nodeId,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req)
}

export const updateNodeChannelAuthorization = async (googleSignInClient: GoogleSignInClient, authorization: NodeChannelAuthorization) => {
    const req: UpdateNodeChannelAuthorizationRequest ={
        type: 'updateNodeChannelAuthorization',
        authorization,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req)
}

export const deleteNodeChannelAuthorization = async (googleSignInClient: GoogleSignInClient, channelName: ChannelName, nodeId: NodeId) => {
    const req: DeleteNodeChannelAuthorizationRequest = {
        type: 'deleteNodeChannelAuthorization',
        channelName,
        nodeId,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req)
}

export const updateChannelProperty = async (googleSignInClient: GoogleSignInClient, channelName: ChannelName, propertyName: 'bucketUri' | 'ablyApiKey' | 'googleServiceAccountCredentials', propertyValue: string) => {
    const req: UpdateChannelPropertyRequest = {
        type: 'updateChannelProperty',
        channelName,
        propertyName,
        propertyValue,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req)
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
    
    const handleAddAuthorizedNode = useCallback((channelName: ChannelName, nodeId: string) => {
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

    const handleDeleteAuthorization = useCallback((channelName: ChannelName, nodeId: NodeId) => {
        // hideAddChannelMembership()
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await deleteNodeChannelAuthorization(googleSignInClient, channelName, nodeId)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode])

    const handleChangeChannelProperty = useCallback((x: string, propertyName: 'bucketUri' | 'ablyApiKey' | 'googleServiceAccountCredentials') => {
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await updateChannelProperty(googleSignInClient, channelName, propertyName, x)
                incrementRefreshCode()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, incrementRefreshCode, channelName])

    const handleChangeBucketUri = useCallback((x: string) => {
        handleChangeChannelProperty(x, 'bucketUri')
    }, [handleChangeChannelProperty])

    const handleChangeAblyApiKey = useCallback((x: string) => {
        handleChangeChannelProperty(x, 'ablyApiKey')
    }, [handleChangeChannelProperty])

    const handleChangeGoogleServiceAccountCredentials = useCallback((x: string) => {
        handleChangeChannelProperty(x, 'googleServiceAccountCredentials')
    }, [handleChangeChannelProperty])

    useEffect(() => {
        if (!userId) return undefined
        ;(async () => {
            const req: GetChannelRequest = {
                type: 'getChannel',
                channelName,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const x = await kacheryHubApiRequest(req)
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
        ret.push({
            key: 'googleBucketName',
            label: 'Bucket URI:',
            value: <EditString value={channel?.bucketUri || ''} onChange={channel ? handleChangeBucketUri : undefined} />
        })
        ret.push({
            key: 'ablyApiKey',
            label: 'Ably API key:',
            value: <EditString value={channel?.ablyApiKey || ''} onChange={channel ? handleChangeAblyApiKey : undefined} />
        })
        ret.push({
            key: 'googleServiceAccountCredentials',
            label: 'Google service account credentials:',
            value: <EditString value={channel?.googleServiceAccountCredentials || ''} onChange={channel ? handleChangeGoogleServiceAccountCredentials : undefined} />
        })
        return ret
    }, [channelName, channel, handleChangeBucketUri, handleChangeAblyApiKey, handleChangeGoogleServiceAccountCredentials])
    return (
        <div className="EditChannel">
            <h2>Channel configuration</h2>
            <p>The owner of each kachery channel provides the cloud resources for that channel.</p>
            {
                channel ? (
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
                        <EditChannelAuthorizedNodes
                            channel={channel}
                            onAddAuthorizedNode={handleAddAuthorizedNode}
                            onUpdateAuthorization={handleUpdateAuthorization}
                            onDeleteAuthorization={handleDeleteAuthorization}
                        />
                    </span>
                ) : (
                    <span>Loading channel: {channelName}</span>
                )
            }
            
            {
                errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
            }
        </div>
    )
}

export default EditChannel