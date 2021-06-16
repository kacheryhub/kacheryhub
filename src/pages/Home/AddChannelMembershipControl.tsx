import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { ChannelName, isChannelName } from '../../kachery-js/types/kacheryTypes'

type Props = {
    onAddChannelMembership: (channelName: ChannelName) => void
    onCancel: () => void
}

const AddChannelMembershipControl: FunctionComponent<Props> = ({onAddChannelMembership, onCancel}) => {
    const [editChannelName, setEditChannelName] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditChannelName(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditChannelName('')
        if (!isChannelName(editChannelName)) throw Error('Unexpected')
        onAddChannelMembership(editChannelName)
    }, [editChannelName, onAddChannelMembership])
    const okayToAdd = useMemo(() => {
        return isChannelName(editChannelName)
    }, [editChannelName])
    return (
        <div>
            <span>
                <span>Channel name:</span>
                <input type="text" value={editChannelName} onChange={handleChange} />
                <button onClick={okayToAdd ? handleAdd : undefined} disabled={!okayToAdd}>Add</button>
                <button onClick={onCancel}>Cancel</button>
            </span>
        </div>
    )
}

export default AddChannelMembershipControl