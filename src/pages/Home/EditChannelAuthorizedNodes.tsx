import { IconButton } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { isNodeId, NodeId } from '../../common/kacheryTypes/kacheryTypes'
import { ChannelConfig, NodeChannelAuthorization } from '../../common/types'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'
import useVisible from '../../commonComponents/useVisible'
import AddAuthorizedNodeControl from './AddAuthorizedNodeControl'
import EditNodeChannelAuthorization from './EditNodeChannelAuthorization'

type Props = {
    channel: ChannelConfig
    onAddAuthorizedNode?: (channelName: string, nodeId: string) => void
    onUpdateAuthorization?: (a: NodeChannelAuthorization) => void
    onDeleteAuthorization?: (channelName: string, nodeId: NodeId) => void
}

const EditChannelAuthorizedNodes: FunctionComponent<Props> = ({channel, onUpdateAuthorization, onAddAuthorizedNode, onDeleteAuthorization}) => {
    const columns = useMemo(() => ([
        {
            key: 'node',
            label: 'Node'
        },
        {
            key: 'authorization',
            label: 'Authorization'
        }
    ]), [])
    const rows = useMemo(() => (
        (channel.authorizedNodes || []).map(x => (
            {
                key: x.nodeId.toString(),
                columnValues: {
                    node: x.nodeId,
                    authorization: {
                        element: <EditNodeChannelAuthorization authorization={x} onUpdateAuthorization={onUpdateAuthorization} />
                    }
                }
            }
        ))
    ), [channel, onUpdateAuthorization])
    const {visible: addAuthorizedNodeVisible, show: showAddAuthorizedNode, hide: hideAddAuthorizedNode} = useVisible()

    const handleDeleteAuthorization = useCallback((nodeId: string) => {
        if (!isNodeId(nodeId)) {
            console.warn('Invalid node id', nodeId)
            return
        }
        onDeleteAuthorization && onDeleteAuthorization(channel.channelName, nodeId)
    }, [channel.channelName, onDeleteAuthorization])

    return (
        <div>
            <h4>Authorized nodes</h4>
            {
                onAddAuthorizedNode && (
                    <span>
                        <IconButton onClick={showAddAuthorizedNode} title="Add authorized node"><Add /></IconButton>
                        {
                            addAuthorizedNodeVisible && (
                                <span>
                                    <AddAuthorizedNodeControl
                                        channelName={channel.channelName}
                                        onAddAuthorizedNode={(channelName, nodeId) => {hideAddAuthorizedNode(); onAddAuthorizedNode(channelName, nodeId);}}
                                        onCancel={hideAddAuthorizedNode}
                                    />
                                </span>
                            )
                        }
                    </span>
                )
            }
            <span className="AlternateRowColors">
                <NiceTable
                    columns={columns}
                    rows={rows}
                    onDeleteRow={onDeleteAuthorization ? handleDeleteAuthorization : undefined}
                />
            </span>
        </div>
    )
}

export default EditChannelAuthorizedNodes