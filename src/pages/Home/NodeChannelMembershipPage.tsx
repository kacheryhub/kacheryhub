import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import useGoogleSignInClient from 'common/googleSignIn/useGoogleSignInClient';
import { NodeChannelMembership } from 'kachery-js/types/kacheryHubTypes';
import { ChannelName, NodeId } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { updateNodeChannelMembership, useNodeConfig } from './EditNode';
import EditNodeChannelAuthorization from './EditNodeChannelAuthorization';
import EditNodeChannelMembership from './EditNodeChannelMembership';
import EditNodeChannelPasscodes from './EditNodeChannelPasscodes';

type Props = {
    nodeId: NodeId
    channelName: ChannelName
}

const NodeChannelMembershipPage: FunctionComponent<Props> = ({nodeId, channelName}) => {
    const {nodeConfig, refreshNodeConfig} = useNodeConfig(nodeId)
    const nodeChannelMembership = useMemo(() => {
        if (!nodeConfig) return undefined
        const a = (nodeConfig.channelMemberships || []).filter(m => (m.channelName === channelName))
        if (a.length === 0) return undefined
        return a[0]
    }, [channelName, nodeConfig])

    return (
        nodeChannelMembership ? (
            <div>
                <NodeChannelMembershipView
                    nodeChannelMembership={nodeChannelMembership}
                    onRefresh={refreshNodeConfig}
                />
            </div>
        ) : (
            <div>Node channel membership not found</div>
        )
    )
}

type Props2 = {
    nodeChannelMembership: NodeChannelMembership
    onRefresh: () => void
}

const NodeChannelMembershipView: FunctionComponent<Props2> = ({nodeChannelMembership, onRefresh}) => {
    const googleSignInClient = useGoogleSignInClient()
    const [errorMessage, setErrorMessage] = useState<string>('')

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
                onRefresh()
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, onRefresh])

    return (
        <div style={{padding: 20}}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Node</TableCell>
                        <TableCell>{nodeChannelMembership.nodeId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Channel</TableCell>
                        <TableCell>{nodeChannelMembership.channelName}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {
                errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
            }
            <div>
                This node has the following permissions on this channel:
            </div>
            <h2>Passcodes</h2>
            <div>The following passcodes are being used</div>
            <EditNodeChannelPasscodes
                nodeChannelMembership={nodeChannelMembership}
                onUpdateNodeChannelMembership={handleUpdateNodeChannelMembership}
            />
            <h2>Permissions</h2>
            <div>
                This node has the following permissions on this channel:
            </div>
            <EditNodeChannelAuthorization
                authorization={nodeChannelMembership.authorization}
            />
            <h2>Roles</h2>
            <div>This node is serving in the following roles on this channel:</div>
            <EditNodeChannelMembership
                nodeChannelMembership={nodeChannelMembership}
                onUpdateNodeChannelMembership={handleUpdateNodeChannelMembership}
            />
        </div>
    )
}

export default NodeChannelMembershipPage