import { MenuItem, Select } from '@material-ui/core';
import useGoogleSignInClient from 'commonComponents/googleSignIn/useGoogleSignInClient';
import { NodeConfig } from 'kacheryInterface/kacheryHubTypes';
import { isNodeId, NodeId } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useCallback } from 'react';
import useNodesForUser from './useNodesForUser';

type Props = {
    nodeId?: NodeId
    onNodeIdSelected: (id: NodeId) => void
}

const DropdownNodeSelector: FunctionComponent<Props> = ({nodeId, onNodeIdSelected}) => {
    const googleSignInClient = useGoogleSignInClient()
    const {nodesForUser: nodes} = useNodesForUser(googleSignInClient?.userId)
    const handleChange = useCallback((event: any) => {
        const id = event.target.value
        if (isNodeId(id)) {
            onNodeIdSelected(id)
        }
    }, [onNodeIdSelected])
    return (
        <div>
            <Select value={(nodeId || '<select>').toString()} onChange={handleChange}>
                <MenuItem value="<select>">Select node</MenuItem>
                {
                    (nodes || []).map((node) => (
                        <MenuItem key={node.nodeId.toString()} value={node.nodeId.toString()}>
                            {node.nodeId} ({getNodeLabel(node)})
                        </MenuItem>
                    ))
                }
            </Select>
        </div>
    )
}

export const getNodeLabel = (node: NodeConfig) => {
    return node?.lastNodeReport ? node?.lastNodeReport.nodeLabel : ''
}

export default DropdownNodeSelector