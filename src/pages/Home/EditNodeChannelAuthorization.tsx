import { Checkbox, IconButton } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { NodeChannelAuthorization } from '../../kachery-js/types/kacheryHubTypes'

type Props = {
    authorization?: NodeChannelAuthorization
    onUpdateAuthorization?: (a: NodeChannelAuthorization) => void
}

const permissions = [
    [
        {key: 'requestFiles', label: 'Request files'},
        {key: 'requestFeeds', label: 'Request feeds'},
        {key: 'requestTasks', label: 'Request tasks'},
    ],
    [
        {key: 'provideFiles', label: 'Provide files'},
        {key: 'provideFeeds', label: 'Provide feeds'},
        {key: 'provideTasks', label: 'Provide tasks', requiresAuth: true}
    ]
]

const EditNodeChannelAuthorization: FunctionComponent<Props> = ({authorization, onUpdateAuthorization}) => {
    const [editAuthorization, setEditAuthorization] = useState<NodeChannelAuthorization | undefined>(undefined)
    const [editing, setEditing] = useState<boolean>(false)
    const handleCancel = useCallback(() => {
        setEditAuthorization(undefined)
        setEditing(false)
    }, [])
    const handleSave = useCallback(() => {
        if (!editAuthorization) return
        onUpdateAuthorization && onUpdateAuthorization(editAuthorization)
        setEditing(false)
    }, [onUpdateAuthorization, editAuthorization])
    const handleEdit = useCallback(() => {
        setEditAuthorization(authorization)
        setEditing(true)
    }, [authorization])

    const a = useMemo(() => {
        if (editing) return editAuthorization
        else return authorization
    }, [editAuthorization, authorization, editing])

    const handleChange = useCallback((roleKey: string, v: boolean) => {
        if (!editing) return
        if (!editAuthorization) return
        setEditAuthorization({
            ...editAuthorization,
            permissions: {
                ...editAuthorization.permissions,
                [roleKey]: v
            }
        })
    }, [editAuthorization, editing])
    
    if (!authorization) return <span>No authorization</span>
    return (
        <div style={{maxWidth: 500, backgroundColor: editing ? 'white' : 'inherit'}}>
            <table>
                <tbody>
                    {
                        permissions.map((p, i) => (
                            <tr key={i}>
                                {
                                    p.map((x, j) => (
                                        <td key={j}>
                                            <PermissionComponent key={x.key} roleKey={x.key} label={x.label} authorization={a} disabled={!editing} onChange={handleChange} />
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
                    onUpdateAuthorization ? (
                        <IconButton onClick={handleEdit} title="Edit authorization"><Edit /></IconButton>
                    ) : (<span />)
                )
            }
        </div>
    )
}

type PermissionComponentProps = {
    roleKey: string,
    label: string,
    authorization?: NodeChannelAuthorization
    disabled: boolean
    onChange: (roleKey: string, v: boolean) => void
}

const PermissionComponent: FunctionComponent<PermissionComponentProps> = ({roleKey, label, authorization, disabled, onChange}) => {
    const authorized = (
        (authorization) && ((authorization.permissions as {[key: string]: boolean})[roleKey])
    )
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.checked
        onChange(roleKey, v)
    }, [roleKey, onChange])
    return (
        <span>
            <Checkbox checked={authorized ? true : false} disabled={disabled} onChange={handleChange} />
            <span style={{color: 'black'}}>{label}</span>
        </span>
    )
}

export default EditNodeChannelAuthorization