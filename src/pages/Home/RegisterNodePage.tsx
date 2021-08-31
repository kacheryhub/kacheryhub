import useGoogleSignInClient from 'common/googleSignIn/useGoogleSignInClient';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import MarkdownDialog from 'commonComponents/Markdown/MarkdownDialog';
import useVisible from 'commonComponents/useVisible';
import { NodeConfig } from 'kachery-js/types/kacheryHubTypes';
import { isNodeId, NodeId } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import hostKacheryNodeMd from '../../markdown/hostKacheryNode.md.gen';
import AddNodeControl from './AddNodeControl';
import { getNodeLabel } from './DropdownNodeSelector';
import { addNode } from './NodeListSection';
import useNodesForUser from './useNodesForUser';
import usePage from './usePage';

type Props = {

}

const RegisterNodePage: FunctionComponent<Props> = () => {
    const hostKacheryNodeVisible = useVisible()

    const [addedNodeId, setAddedNodeId] = useState<NodeId | undefined>(undefined)
    const googleSignInClient = useGoogleSignInClient()
    const [status, setStatus] = useState<'ready' | 'processing' | 'finished'>('ready')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const {nodesForUser} = useNodesForUser(googleSignInClient?.userId)

    // todo: deduplicate this code
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
            setAddedNodeId(nodeId)
            setStatus('finished')
        }).catch((err) => {
            setErrorMessage(err.message)
            setStatus('ready')
        })
    }, [googleSignInClient, status])

    const {setPage} = usePage()

    const handleGotoNode = useCallback((nodeId: NodeId) => {
        setPage({
            page: 'node',
            nodeId
        })
    }, [setPage])

    useEffect(() => {
        if ((status === 'finished') && (addedNodeId)) {
            handleGotoNode(addedNodeId)
        }
    }, [status, addedNodeId, handleGotoNode])

    return (
        <div>
            <h2>Register a kachery node</h2>
            <p>
                To register a kachery node, you must first
                &nbsp;<Hyperlink onClick={hostKacheryNodeVisible.show}>host a kachery node</Hyperlink>
                &nbsp;on your computer.
            </p>
            <p>Once your node daemon is running, copy and paste the 64-character node ID here:</p>
            <AddNodeControl
                onAddNode={handleAddNode}
            />
            {
                status === 'processing' &&
                <span>{status === 'processing' && (<span>Processing...</span>)}</span>
            }
            {
                errorMessage && (
                    <div style={{color: 'red'}}>{errorMessage}</div>
                )
            }
            <p>You have already registered the following nodes:</p>
            <ul>
                {
                    (nodesForUser || []).map(node => (
                        <li><Hyperlink onClick={() => {handleGotoNode(node.nodeId)}}>{node.nodeId} ({getNodeLabel(node)})</Hyperlink></li>
                    ))
                }
            </ul>
            <MarkdownDialog
                visible={hostKacheryNodeVisible.visible}
                onClose={hostKacheryNodeVisible.hide}
                source={hostKacheryNodeMd}
                linkTarget="_blank"
            />
        </div>
    )
}

export default RegisterNodePage