import { IconButton } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { isNodeId, NodeId } from '../../common/types/kacheryTypes'
import { ChannelConfig, NodeChannelAuthorization } from '../../common/types/kacheryHubTypes'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'
import useVisible from '../../commonComponents/useVisible'
import AbbreviatedNodeId from './AbbreviatedNodeId'
import AddAuthorizedNodeControl from './AddAuthorizedNodeControl'
import EditNodeChannelAuthorization from './EditNodeChannelAuthorization'
import usePage from './usePage'

type Props = {
    channel: ChannelConfig
    onAddAuthorizedNode?: (channelName: string, nodeId: string) => void
    onUpdateAuthorization?: (a: NodeChannelAuthorization) => void
    onDeleteAuthorization?: (channelName: string, nodeId: NodeId) => void
}

const EditChannelAuthorizedNodes: FunctionComponent<Props> = ({channel, onUpdateAuthorization, onAddAuthorizedNode, onDeleteAuthorization}) => {
    const {setPage} = usePage()
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
    const gotoNodePage = useCallback((nodeId: NodeId) => {
        setPage({page: 'node', nodeId})
    }, [setPage])
    const rows = useMemo(() => (
        (channel.authorizedNodes || []).map(x => (
            {
                key: x.nodeId.toString(),
                columnValues: {
                    node: {
                        text: x.nodeId,
                        element: <AbbreviatedNodeId nodeId={x.nodeId} onClick={() => gotoNodePage(x.nodeId)} />
                    },
                    authorization: {
                        element: <EditNodeChannelAuthorization authorization={x} onUpdateAuthorization={onUpdateAuthorization} />
                    }
                }
            }
        ))
    ), [channel, onUpdateAuthorization, gotoNodePage])
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
            <h2>Authorized nodes</h2>
            <p>Configure which nodes are authorized to belong to this channel in which roles.</p>
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