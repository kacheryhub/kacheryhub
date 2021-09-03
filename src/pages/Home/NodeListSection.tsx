import { IconButton } from '@material-ui/core'
import { AddCircle, Refresh } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import kacheryHubApiRequest from '../../common/kacheryHubApiRequest'
import { isNodeId, NodeId } from 'kachery-js/types/kacheryTypes'
import { AddNodeRequest, DeleteNodeRequest, NodeConfig } from 'kachery-js/types/kacheryHubTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import MarkdownDialog from '../../commonComponents/Markdown/MarkdownDialog'
import useVisible from '../../commonComponents/useVisible'
import AddNodeControl from './AddNodeControl'
import NodesTable from './NodesTable'
import useNodesForUser from './useNodesForUser'
import hostKacheryNodeMd from '../../markdown/hostKacheryNode.md.gen'

type Props = {
    onSelectNode: (nodeId: NodeId) => void
}

export const addNode = async (node: NodeConfig, googleSignInClient: GoogleSignInClient) => {
    const req: AddNodeRequest = {
        type: 'addNode',
        node,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: true})
}

const deleteNode = async (nodeId: NodeId, googleSignInClient: GoogleSignInClient) => {
    const req: DeleteNodeRequest = {
        type: 'deleteNode',
        nodeId,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: false})
}

const NodeListSection: FunctionComponent<Props> = ({onSelectNode}) => {
    const googleSignInClient = useGoogleSignInClient()
    const {nodesForUser: nodes, refreshNodesForUser: onRefreshNodes} = useNodesForUser(googleSignInClient?.userId)
    const [status, setStatus] = useState<'ready' | 'processing'>('ready')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const {visible: addingNodeVisible, show: showAddingNode, hide: hideAddingNode} = useVisible()

    const handleAddNode = useCallback((nodeId: string) => {
        if (!googleSignInClient) return
        const userId = googleSignInClient.userId
        if (!userId) return
        if (status !== 'ready') return
        if (!isNodeId(nodeId)) {
            setStatus('ready')
            setErrorMessage('Invalid node ID')
            return
        }
        setStatus('processing')
        setErrorMessage('')
        const newNode: NodeConfig = {
            nodeId,
            ownerId: userId
        }
        addNode(newNode, googleSignInClient).then(() => {
            onRefreshNodes()
            setStatus('ready')
        }).catch((err) => {
            setErrorMessage(err.message)
            setStatus('ready')
        })
    }, [onRefreshNodes, googleSignInClient, status])

    const handleDeleteNode = useCallback((nodeId: NodeId) => {
        if (!googleSignInClient) return
        const userId = googleSignInClient.userId
        if (!userId) return
        if (status !== 'ready') return
        hideAddingNode()
        setStatus('processing')
        setErrorMessage('')
        deleteNode(nodeId, googleSignInClient).then(() => {
            onRefreshNodes()
            setStatus('ready')
        }).catch((err) => {
            setErrorMessage(err.message)
            setStatus('ready')
        })
    }, [onRefreshNodes, googleSignInClient, status, hideAddingNode])
    const hostKacheryNodeVisible = useVisible()

    return (
        <div>
            <h2>Your nodes</h2>
            <p>
                These are nodes hosted by you; each is associated with a kachery daemon running on a computer.
                You can configure which channels these nodes belong to.
            </p>

            <p><Hyperlink onClick={hostKacheryNodeVisible.show}>How to host a kachery node</Hyperlink></p>
            <MarkdownDialog
                visible={hostKacheryNodeVisible.visible}
                onClose={hostKacheryNodeVisible.hide}
                source={hostKacheryNodeMd}
                linkTarget="_blank"
            />

            {
                (status === 'ready') && (
                    <span>
                        <IconButton onClick={onRefreshNodes} title="Refresh nodes"><Refresh /></IconButton>
                        <IconButton onClick={showAddingNode} title="Add kachery node"><AddCircle /></IconButton>
                    </span>
                )
            }
            {
                ((status === 'ready') && (nodes) && (addingNodeVisible)) ? (
                    <AddNodeControl onAddNode={handleAddNode} onCancel={hideAddingNode} />
                ) : (
                    <span>{status === 'processing' && (<span>Processing...</span>)}</span>
                )
            }
            {
                errorMessage && (
                    <div style={{color: 'red'}}>{errorMessage}</div>
                )
            }
            {
                nodes ? (
                    (nodes && nodes.length === 0) ? (
                        <div>You do not have any nodes</div>
                    ) : (
                        <NodesTable nodes={nodes || []} onDeleteNode={(status === 'ready') ? handleDeleteNode : undefined} onClickNode={onSelectNode} />
                    )
                ) : (
                    <div>Loading...</div>
                )
            }
        </div>
    )
}

export default NodeListSection