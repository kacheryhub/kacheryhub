import React, { FunctionComponent, useCallback, useMemo } from 'react'
import formatTime from '../../common/formatTime'
import { isNodeId, NodeId } from 'kachery-js/types/kacheryTypes'
import { NodeConfig } from 'kachery-js/types/kacheryHubTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'

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
                    element: <Hyperlink onClick={() => {onClickNode && onClickNode(node.nodeId)}}>{node.nodeId}</Hyperlink>
                }
            }
        }))
    ), [nodes, onClickNode])
    const handleDeleteNode = useCallback((nodeId: string) => {
        if (!isNodeId(nodeId)) throw Error('Unexpected, not a node id')
        onDeleteNode && onDeleteNode(nodeId)
    }, [onDeleteNode])
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            onDeleteRow={handleDeleteNode}
            deleteRowLabel="Delete node"
        />
    )
}

export default NodesTable