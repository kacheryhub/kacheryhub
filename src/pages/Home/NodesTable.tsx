import NiceTable from 'commonComponents/NiceTable/NiceTable'
import { isNodeId, NodeId } from 'commonInterface/kacheryTypes'
import formatTime from 'commonInterface/util/formatTime'
import { NodeConfig } from 'kacheryInterface/kacheryHubTypes'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import AbbreviatedNodeId from './AbbreviatedNodeId'

type Props = {
    nodes: NodeConfig[]
    onDeleteNode?: (nodeId: NodeId) => void
    onClickNode?: (nodeId: NodeId) => void
}

const NodesTable: FunctionComponent<Props> = ({nodes, onDeleteNode, onClickNode}) => {
    const columns = useMemo(() => ([
        {
            key: 'nodeId',
            label: 'Node'
        },
        {
            key: 'label',
            label: 'Label'
        },
        {
            key: 'lastUpdate',
            label: 'Last update'
        }
    ]), [])
    const rows = useMemo(() => (
        nodes.map(node => ({
            key: node.nodeId.toString(),
            columnValues: {
                label: {
                    text: node.lastNodeReport ? node.lastNodeReport.nodeLabel : ''
                },
                lastUpdate: {
                    text: node.lastNodeReportTimestamp ? formatTime(new Date(Number(node.lastNodeReportTimestamp))) : ''
                },
                nodeId: {
                    text: node.nodeId.toString(),
                    element: (
                        <AbbreviatedNodeId
                            nodeId={node.nodeId}
                            onClick={onClickNode ? () => {onClickNode(node.nodeId)} : undefined}
                            copyable={false}
                        />
                    )
                }
            }
        }))
    ), [nodes, onClickNode])
    const handleDeleteNode = useCallback((nodeId: string) => {
        if (!isNodeId(nodeId)) throw Error('Unexpected, not a node id')
        onDeleteNode && onDeleteNode(nodeId)
    }, [onDeleteNode])
    return (
        <div style={{maxWidth: 700}}>
            <NiceTable
                rows={rows}
                columns={columns}
                onDeleteRow={onDeleteNode ? handleDeleteNode : undefined}
                deleteRowLabel="Delete node"
            />
        </div>
    )
}

export default NodesTable