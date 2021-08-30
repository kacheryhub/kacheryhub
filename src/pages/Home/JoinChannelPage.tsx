import useGoogleSignInClient from 'common/googleSignIn/useGoogleSignInClient';
import { ChannelName, NodeId } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useCallback, useState } from 'react';
import AddChannelMembershipControl from './AddChannelMembershipControl';
import DropdownNodeSelector from './DropdownNodeSelector';
import { addNodeChannelMembership } from './EditNode';

type Props = {

}

const JoinChannelPage: FunctionComponent<Props> = () => {
    const [nodeId, setNodeId] = useState<NodeId | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const googleSignInClient = useGoogleSignInClient()

    const handleAddChannelMembership = useCallback((channelName: ChannelName) => {
        if (!nodeId) return
        setErrorMessage('')
        if (!googleSignInClient) {
            setErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await addNodeChannelMembership(googleSignInClient, nodeId, channelName)
            }
            catch(err) {
                setErrorMessage(err.message)
            }
        })()
    }, [googleSignInClient, nodeId])

    return (
        <div>
            <h2>Join a channel</h2>
            
            <p>Select a node to join to a channel</p>
            <DropdownNodeSelector
                nodeId={nodeId}
                onNodeIdSelected={setNodeId}
            />
            {
                nodeId && (
                    <div>
                        <p>Enter a channel to join:</p>
                        <AddChannelMembershipControl onAddChannelMembership={handleAddChannelMembership} />
                        {
                            errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>
                        }
                    </div>
                )
            }
        </div>
    )
}

export default JoinChannelPage