import { IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { NodeId } from 'commonInterface/kacheryTypes';
import kacheryHubApiRequest from 'kacheryInterface/kacheryHubApiRequest';
import { DeleteNodeRequest } from 'kacheryInterface/kacheryHubTypes';
import BoxButton from 'pages/Home/BoxButton';
import NodesTable from 'pages/Home/NodesTable';
import useNodesForUser from 'pages/Home/useNodesForUser';
import usePage from 'pages/Home/usePage';
import React, { FunctionComponent, useCallback } from 'react';

type Props = {

}

const NodesPart: FunctionComponent<Props> = () => {
    const {userId, googleIdToken} = useSignedIn()
    const {nodesForUser, refreshNodesForUser} = useNodesForUser(userId)
    const {setPage} = usePage()
    const handleRegisterNewNode = useCallback(() => {
        setPage({page: 'registerNode'})
    }, [setPage])

    const handleDeleteNode = useCallback((nodeId: NodeId) => {
        if (!userId) return
        ;(async () => {
            const req: DeleteNodeRequest = {
                type: 'deleteNode',
                nodeId,
                auth: {
                    userId,
                    googleIdToken
                }
            }
            await kacheryHubApiRequest(req, {reCaptcha: false})
            refreshNodesForUser()
        })()
    }, [userId, googleIdToken, refreshNodesForUser])

    const handleClickNode = useCallback((nodeId: NodeId) => {
        setPage({page: 'node', nodeId})
    }, [setPage])

    if (!nodesForUser) return <div>No nodesForUser</div>
    return (
        <div>
            <h2>Your nodes</h2>
            <p>
                These are nodes hosted by you. Each is associated with a kachery daemon running on a computer.
            </p>
            {
                nodesForUser.length === 0 ? (
                    <div>
                        <p>You have not registered any nodes</p>
                        <IconButton onClick={refreshNodesForUser} title="Refresh nodes"><Refresh /></IconButton>
                    </div>
                ) : (
                    <div>
                        <p>You have registered the following nodes:</p>
                        <IconButton onClick={refreshNodesForUser} title="Refresh nodes"><Refresh /></IconButton>
                        <NodesTable
                            nodes={nodesForUser}
                            onClickNode={handleClickNode}
                            onDeleteNode={handleDeleteNode}
                        />
                    </div>
                )
            }
            {
                <BoxButton
                    label="Register a new node"
                    onClick={handleRegisterNewNode}
                />
            }
        </div>
    )
}

export default NodesPart