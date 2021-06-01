import { IconButton } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { NodeId } from '../../common/kacheryTypes/kacheryTypes'
import { AddNodeChannelMembershipRequest, NodeConfig } from '../../common/types'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'
import useVisible from '../../commonComponents/useVisible'
import AddChannelMembershipControl from './AddChannelMembershipControl'
import EditNodeChannelMembershipRoles from './EditNodeChannelMembershipRoles'

type Props = {
    node: NodeConfig
    onRefreshNeeded: () => void
}

const addNodeChannelMembership = async (googleSignInClient: GoogleSignInClient, nodeId: NodeId, channelName: string) => {
    const req: AddNodeChannelMembershipRequest = {
        nodeId,
        channelName,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/addNodeChannelMembership', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const EditNodeChannelMemberships: FunctionComponent<Props> = ({node, onRefreshNeeded}) => {
    const googleSignInClient = useGoogleSignInClient()
    const columns = useMemo(() => ([
        {
            key: 'channel',
            label: 'Channel'
        },
        {
            key: 'roles',
            label: 'Roles'
        }
    ]), [])
    const rows = useMemo(() => (
        (node.channelMemberships || []).map(x => ({
            key: x.channelName,
            columnValues: {
                channel: x.channelName,
                roles: {
                    element: <EditNodeChannelMembershipRoles node={node} channelName={x.channelName} onRefreshNeeded={onRefreshNeeded} />
                }
            }
        }))
    ), [node, onRefreshNeeded])
    const {visible: addChannelMembershipVisible, show: showAddChannelMembership, hide: hideAddChannelMembership} = useVisible()
    const [addChannelMembershipErrorMessage, setAddChannelMembershipErrorMessage] = useState<string>('')
    const handleAddChannelMembership = useCallback((channelName: string) => {
        // hideAddChannelMembership()
        setAddChannelMembershipErrorMessage('')
        if (!googleSignInClient) {
            setAddChannelMembershipErrorMessage('Not signed in')
            return
        }
        ;(async () => {
            try {
                await addNodeChannelMembership(googleSignInClient, node.nodeId, channelName)
                onRefreshNeeded()
                hideAddChannelMembership()
            }
            catch(err) {
                setAddChannelMembershipErrorMessage(err.message)
            }
        })()
        console.log('---- add', channelName)
        setAddChannelMembershipErrorMessage('not yet implemented')
    }, [googleSignInClient, hideAddChannelMembership, node, onRefreshNeeded])
    useEffect(() => {
        if (!addChannelMembershipVisible) {
            setAddChannelMembershipErrorMessage('')
        }
    }, [addChannelMembershipVisible])
    return (
        <div>
            <h4>Channel memberships for {node.nodeId}</h4>
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
            <NiceTable
                columns={columns}
                rows={rows}
            />
        </div>
    )
}

export default EditNodeChannelMemberships