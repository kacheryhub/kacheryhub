import React, { FunctionComponent, useCallback, useState } from 'react'
import { ChannelName } from 'kachery-js/types/kacheryTypes'

type Props = {
    channelName: ChannelName
    onAddAuthorizedNode: (channelName: ChannelName, nodeId: string) => void
    onCancel: () => void
}

const AddAuthorizedNodeControl: FunctionComponent<Props> = ({channelName, onAddAuthorizedNode, onCancel}) => {
    const [editNodeId, setEditNodeId] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditNodeId(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditNodeId('')
        onAddAuthorizedNode(channelName, editNodeId)
    }, [channelName, editNodeId, onAddAuthorizedNode])
    return (
        <div>
            <span>
                <span>Node ID:</span>
                <input type="text" value={editNodeId} onChange={handleChange} />
                <button onClick={handleAdd}>Add</button>
                <button onClick={onCancel}>Cancel</button>
            </span>
        </div>
    )
}

export default AddAuthorizedNodeControl