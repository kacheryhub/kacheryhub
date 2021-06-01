import React, { FunctionComponent, useCallback, useState } from 'react'

type Props = {
    onAddChannelMembership: (channelName: string) => void
    onCancel: () => void
}

const AddChannelMembershipControl: FunctionComponent<Props> = ({onAddChannelMembership, onCancel}) => {
    const [editChannelName, setEditChannelName] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditChannelName(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditChannelName('')
        onAddChannelMembership(editChannelName)
    }, [editChannelName, onAddChannelMembership])
    return (
        <div>
            <span>
                <span>Channel name:</span>
                <input type="text" value={editChannelName} onChange={handleChange} />
                <button onClick={handleAdd}>Add</button>
                <button onClick={onCancel}>Cancel</button>
            </span>
        </div>
    )
}

export default AddChannelMembershipControl