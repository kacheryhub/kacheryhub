import { IconButton } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import { NodeId } from '../../common/types/kacheryTypes'
import { NodeChannelAuthorization, NodeChannelMembership, NodeConfig } from '../../common/types/kacheryHubTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'
import useVisible from '../../commonComponents/useVisible'
import AddChannelMembershipControl from './AddChannelMembershipControl'
import EditNodeChannelAuthorization from './EditNodeChannelAuthorization'
import EditNodeChannelMembership from './EditNodeChannelMembership'
import usePage from './usePage'

type Props = {
    node: NodeConfig
    onAddNodeChannelMembership?: (channelName: string, nodeId: NodeId) => void
    onUpdateNodeChannelMembership?: (a: NodeChannelMembership) => void
    onDeleteNodeChannelMembership?: (channelName: string, nodeId: NodeId) => void
    onUpdateNodeChannelAuthorization?: (a: NodeChannelAuthorization) => void
}

const EditNodeChannelMemberships: FunctionComponent<Props> = ({node, onUpdateNodeChannelMembership, onUpdateNodeChannelAuthorization, onDeleteNodeChannelMembership, onAddNodeChannelMembership}) => {
    const {setPage} = usePage()
    const columns = useMemo(() => ([
        {
            key: 'channel',
            label: "Channel",
            element: <span style={{fontWeight: 'bold'}}>Channel</span>
        },
        {
            key: 'authorization',
            label: 'Authorization',
            element: <span style={{fontWeight: 'bold'}}>Authorization</span>
        },
        {
            key: 'roles',
            label: 'Roles',
            element: <span style={{fontWeight: 'bold'}}>Roles</span>
        }
    ]), [])
    const gotoChannelPage = useCallback((channelName: string) => {
        setPage({page: 'channel', channelName})
    }, [setPage])
    const rows = useMemo(() => (
        (node.channelMemberships || []).map(x => (
            {
                key: x.channelName,
                columnValues: {
                    channel: {
                        text: x.channelName,
                        element: <Hyperlink onClick={() => gotoChannelPage(x.channelName)}>{x.channelName}</Hyperlink>
                    },
                    authorization: {
                        element: <EditNodeChannelAuthorization authorization={x.authorization} onUpdateAuthorization={onUpdateNodeChannelAuthorization} />
                    },
                    roles: {
                        element: <EditNodeChannelMembership nodeChannelMembership={x} onUpdateNodeChannelMembership={onUpdateNodeChannelMembership} />
                    }
                }
            }
        ))
    ), [node, onUpdateNodeChannelMembership, onUpdateNodeChannelAuthorization, gotoChannelPage])
    const {visible: addChannelMembershipVisible, show: showAddChannelMembership, hide: hideAddChannelMembership} = useVisible()
    const [addChannelMembershipErrorMessage, setAddChannelMembershipErrorMessage] = useState<string>('')

    const handleAddChannelMembership = useCallback((channelName: string) => {
        onAddNodeChannelMembership && onAddNodeChannelMembership(channelName, node.nodeId)
    }, [onAddNodeChannelMembership, node.nodeId])
    
    useEffect(() => {
        if (!addChannelMembershipVisible) {
            setAddChannelMembershipErrorMessage('')
        }
    }, [addChannelMembershipVisible])
    const handleDeleteChannelMembership = useCallback((channelName: string) => {
        onDeleteNodeChannelMembership && onDeleteNodeChannelMembership(channelName, node.nodeId)
    }, [onDeleteNodeChannelMembership, node.nodeId])
    return (
        <div>
            <h2>Channel memberships</h2>
            <p>Configure which channels this node belongs to as well as its roles in those channels. Roles must be authorized by the owner of each channel.</p>
            <IconButton onClick={showAddChannelMembership} title="Add channel membership"><Add /></IconButton>
            {
                addChannelMembershipVisible && (
                    <span>
                        <AddChannelMembershipControl onAddChannelMembership={handleAddChannelMembership} onCancel={hideAddChannelMembership} />
                        {
                            addChannelMembershipErrorMessage && <div style={{color: 'red'}}>{addChannelMembershipErrorMessage}</div>
                        }
                    </span>
                )
            }
            <span className="AlternateRowColors">
                <NiceTable
                    columns={columns}
                    rows={rows}
                    onDeleteRow={onDeleteNodeChannelMembership ? handleDeleteChannelMembership : undefined}
                />
            </span>
        </div>
    )
}

export default EditNodeChannelMemberships