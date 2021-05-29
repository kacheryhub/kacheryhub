import React, { useCallback, useState } from 'react'
import { FunctionComponent } from "react"

type Props = {
    onAddChannel: (channelName: string) => void
}

const AddChannelControl: FunctionComponent<Props> = ({onAddChannel}) => {
    const [editing, setEditing] = useState<boolean>(false)
    const [editChannelName, setEditChannelName] = useState<string>('')
    const handleCancel = useCallback(() => {
        setEditChannelName('')
        setEditing(false)
    }, [])
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditChannelName(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditChannelName('')
        setEditing(false)
        onAddChannel(editChannelName)
    }, [editChannelName, onAddChannel])
    return (
        <div>
            {
                editing ? (
                    <span>
                        <span>Channel name:</span>
                        <input type="text" value={editChannelName} onChange={handleChange} />
                        <button onClick={handleAdd}>Add</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </span>
                ) : (
                    <button onClick={() => setEditing(true)}>Add channel</button>
                )
            }
        </div>
    )
}

export default AddChannelControl