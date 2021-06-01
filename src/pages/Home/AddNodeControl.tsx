import React, { FunctionComponent, useCallback, useState } from 'react'

type Props = {
    onAddNode: (nodeId: string) => void
    onCancel: () => void
}

const AddNodeControl: FunctionComponent<Props> = ({onAddNode, onCancel}) => {
    const [editNodeId, setEditNodeId] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditNodeId(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditNodeId('')
        onAddNode(editNodeId)
    }, [editNodeId, onAddNode])
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

export default AddNodeControl