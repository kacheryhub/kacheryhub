import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { isNodeId, NodeId } from '../../common/kacheryTypes/kacheryTypes'
import { NodeConfig } from '../../common/types'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'

type Props = {
    nodes: NodeConfig[]
    onForgetNode?: (nodeId: NodeId) => void
}

const NodesTable: FunctionComponent<Props> = ({nodes, onForgetNode}) => {
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Node'
        },
        {
            key: 'nodeId',
            label: 'Node ID'
        }
    ]), [])
    const rows = useMemo(() => (
        nodes.map(node => ({
            key: node.nodeId.toString(),
            columnValues: {
                label: {
                    text: node.label
                },
                nodeId: {
                    text: node.nodeId.toString()
                }
            }
        }))
    ), [nodes])
    const handleForgetNode = useCallback((nodeId: string) => {
        if (!isNodeId(nodeId)) throw Error('Unexpected, not a node id')
        onForgetNode && onForgetNode(nodeId)
    }, [onForgetNode])
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            onDeleteRow={handleForgetNode}
            deleteRowLabel="Forget node"
        />
    )
}

export default NodesTable