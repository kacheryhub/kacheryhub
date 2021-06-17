import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { ChannelName, isChannelName } from 'kachery-js/types/kacheryTypes'

type Props = {
    onAddChannel: (channelName: ChannelName) => void
    onCancel: () => void
}

const AddChannelControl: FunctionComponent<Props> = ({onAddChannel, onCancel}) => {
    const [editChannelName, setEditChannelName] = useState<string | undefined>(undefined)
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditChannelName(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditChannelName(undefined)
        if (!isChannelName(editChannelName)) throw Error('Unexpected')
        if (editChannelName) onAddChannel(editChannelName)
    }, [editChannelName, onAddChannel])
    const okayToAdd = useMemo(() => {
        return isChannelName(editChannelName)
    }, [editChannelName])
    return (
        <div>
            <span>
                <span>Channel name:</span>
                <input type="text" value={(editChannelName || '').toString()} onChange={handleChange} />
                <button onClick={okayToAdd ? handleAdd : undefined} disabled={!okayToAdd}>Add</button>
                <button onClick={onCancel}>Cancel</button>
            </span>
        </div>
    )
}

export default AddChannelControl