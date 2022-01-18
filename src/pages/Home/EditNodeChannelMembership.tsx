import { IconButton } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { NodeChannelMembership } from 'kacheryInterface/kacheryHubTypes'
import RoleComponent from './RoleComponent'

type Props = {
    nodeChannelMembership?: NodeChannelMembership
    onUpdateNodeChannelMembership?: (a: NodeChannelMembership) => void
}

const roles = [
    [
        {key: 'downloadFiles', label: 'Download files', requiresAuth: false},
        {key: 'downloadFeeds', label: 'Download feeds', requiresAuth: false},
        {key: 'downloadTasks', label: 'Download tasks', requiresAuth: false}
    ],
    [
        {key: 'requestFiles', label: 'Request files', requiresAuth: true},
        {key: 'requestFeeds', label: 'Request feeds', requiresAuth: true},
        {key: 'requestTasks', label: 'Request tasks', requiresAuth: true},
    ],
    [
        {key: 'provideFiles', label: 'Provide files', requiresAuth: true},
        {key: 'provideFeeds', label: 'Provide feeds', requiresAuth: true},
        {key: 'provideTasks', label: 'Provide tasks', requiresAuth: true}
    ]
]

const EditNodeChannelMembership: FunctionComponent<Props> = ({nodeChannelMembership, onUpdateNodeChannelMembership}) => {
    // const googleSignInClient = useGoogleSignInClient()
    const [editNodeChannelMembership, setEditNodeChannelMembership] = useState<NodeChannelMembership | undefined>(undefined)
    const [editing, setEditing] = useState<boolean>(false)
    const handleCancel = useCallback(() => {
        setEditNodeChannelMembership(undefined)
        setEditing(false)
    }, [])
    const handleSave = useCallback(() => {
        if (!editNodeChannelMembership) return
        onUpdateNodeChannelMembership && onUpdateNodeChannelMembership(editNodeChannelMembership)
        setEditing(false)
    }, [onUpdateNodeChannelMembership, editNodeChannelMembership])
    const handleEdit = useCallback(() => {
        setEditNodeChannelMembership(nodeChannelMembership)
        setEditing(true)
    }, [nodeChannelMembership])

    const a = useMemo(() => {
        if (editing) return editNodeChannelMembership
        else return nodeChannelMembership
    }, [editNodeChannelMembership, nodeChannelMembership, editing])

    const handleChange = useCallback((roleKey: string, v: boolean) => {
        if (!editing) return
        if (!editNodeChannelMembership) return
        setEditNodeChannelMembership({
            ...editNodeChannelMembership
            // roles: {
            //     ...editNodeChannelMembership.roles,
            //     [roleKey]: v
            // }
        })
    }, [editNodeChannelMembership, editing])
    
    if (!nodeChannelMembership) return <span />
    return (
        <div style={{maxWidth: 500, backgroundColor: editing ? 'white' : 'inherit'}}>
            <table>
                <tbody>
                    {
                        roles.map((r, i) => (
                            <tr key={i}>
                                {
                                    r.map((x, j) => (
                                        <td key={j}>
                                            <RoleComponent key={x.key} roleKey={x.key} label={x.label} requiresAuth={x.requiresAuth} nodeChannelMembership={a} onChange={editNodeChannelMembership && handleChange} />
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {
                editing ? (
                    <div>
                        <button onClick={handleSave}>Save changes</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </div>
                ) : (
                    onUpdateNodeChannelMembership ? (
                        <IconButton onClick={handleEdit} title="Edit roles"><Edit /></IconButton>
                    ) : (<span />)
                )
            }
        </div>
    )
}

export default EditNodeChannelMembership