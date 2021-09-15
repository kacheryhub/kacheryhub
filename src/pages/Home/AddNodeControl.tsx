import { isNodeId } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

type Props = {
    onAddNode: (nodeId: string) => void
    onCancel?: () => void
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
    const okayToAdd = useMemo(() => {
        return isNodeId(editNodeId)
    }, [editNodeId])
    return (
        <div>
            <span>
                <span>Node ID: </span>
                <input type="text" value={editNodeId} onChange={handleChange} />
                <button onClick={handleAdd} disabled={!okayToAdd}>Add</button>
                {onCancel && <button onClick={onCancel}>Cancel</button>}
            </span>
        </div>
    )
}

export default AddNodeControl