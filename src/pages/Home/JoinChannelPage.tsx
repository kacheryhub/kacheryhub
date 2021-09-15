import useGoogleSignInClient from 'commonInterface/googleSignIn/useGoogleSignInClient';
import Hyperlink from 'commonInterface/commonComponents/Hyperlink/Hyperlink';
import { ChannelName, NodeId } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import AddChannelMembershipControl from './AddChannelMembershipControl';
import DropdownNodeSelector from './DropdownNodeSelector';
import { addNodeChannelMembership } from './EditNode';
import useNodeConfig from './useNodeConfig';
import usePage from './usePage';

type Props = {
    nodeId?: NodeId
}

const JoinChannelPage: FunctionComponent<Props> = ({nodeId}) => {
    const [internalNodeId, setInternalNodeId] = useState<NodeId | undefined>(undefined)
    const [status, setStatus] = useState<'waiting' | 'processing' | 'finished'>('waiting')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const googleSignInClient = useGoogleSignInClient()
    const {setPage} = usePage()

    const selectedNodeId = useMemo(() => (
        nodeId || internalNodeId
    ), [nodeId, internalNodeId])

    const handleSelectNodeChannelMembership = useCallback((channelName: ChannelName) => {
        if (!selectedNodeId) return
        setPage({
            page: 'nodeChannelMembership',
            nodeId: selectedNodeId,
            channelName
        })
    }, [selectedNodeId, setPage])

    const handleAddChannelMembership = useCallback((channelName: ChannelName) => {
        if (!selectedNodeId) return
        setErrorMessage('')
        setStatus('processing')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await addNodeChannelMembership(googleSignInClient, selectedNodeId, channelName)
                setStatus('finished')
                handleSelectNodeChannelMembership(channelName)
            }
            catch(err: any) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, selectedNodeId, handleSelectNodeChannelMembership])

    return (
        <div>
            <h2>Join a channel</h2>
            {
                (!nodeId) ? (
                    <div>
                        <p>Select a node to join to a channel</p>
                        <DropdownNodeSelector
                            nodeId={internalNodeId}
                            onNodeIdSelected={setInternalNodeId}
                        />
                    </div>
                ) : (
                    <div>
                        Node: {nodeId}
                    </div>
                )
            }
            {
                selectedNodeId && (
                    <div>
                        <p>Enter the name of a channel to join:</p>
                        <AddChannelMembershipControl readOnly={status !== 'waiting'} onAddChannelMembership={handleAddChannelMembership} />
                        {
                            errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
                        }
                        <NodeChannelMemberships
                            nodeId={selectedNodeId}
                            onSelectNodeChannelMembership={handleSelectNodeChannelMembership}
                        />
                    </div>
                )
            }
        </div>
    )
}

const NodeChannelMemberships: FunctionComponent<{nodeId: NodeId, onSelectNodeChannelMembership: (channelName: ChannelName) => void}> = ({nodeId, onSelectNodeChannelMembership}) => {
    const {nodeConfig} = useNodeConfig(nodeId)
    const nodeChannelMemberships = useMemo(() => (
        nodeConfig?.channelMemberships || []
    ), [nodeConfig])
    if (nodeChannelMemberships.length === 0) {
        return <p>This node is not a member of any channel</p>
    }
    else {
        return (
            <div>
                <div>
                    <p>This node is a member of the following channels:</p>
                </div>
                <div>
                    <span>| </span>
                    {
                        nodeChannelMemberships.map(m => (
                            <span><Hyperlink onClick={() => {onSelectNodeChannelMembership(m.channelName)}}>{m.channelName}</Hyperlink> | </span>
                        ))
                    }
                </div>
            </div>
        )
    }
}

export default JoinChannelPage