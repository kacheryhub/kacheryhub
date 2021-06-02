import { IconButton, Input } from '@material-ui/core'
import { Cancel, Check, Edit } from '@material-ui/icons'
import React, { FunctionComponent, useCallback, useState } from 'react'
import useVisible from '../../commonComponents/useVisible'

type Props = {
    value: string
    onChange?: (x: string) => void
}

const EditString: FunctionComponent<Props> = ({value, onChange}) => {
    const {visible: editing, hide: stopEditing, show: startEditing} = useVisible()
    const [editText, setEditText] = useState<string>('')
    const handleEdit = useCallback(() => {
        setEditText(value !== '*private*' ? value : '')
        startEditing()
    }, [startEditing, value])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value as string
        setEditText(v)
    }, [])

    const handleAccept = useCallback(() => {
        onChange && onChange(editText)
        stopEditing()
    }, [onChange, editText, stopEditing])

    return (
        <span>
            {
                editing ? (
                    <span>
                        <Input type="text" value={editText} onChange={handleChange} />
                        <IconButton onClick={handleAccept} title="Accept"><Check /></IconButton>
                        <IconButton onClick={stopEditing} title="Cancel"><Cancel /></IconButton>
                    </span>
                ) : (
                    <span>{value} {onChange && <IconButton onClick={handleEdit} title="Edit"><Edit /></IconButton>}</span>
                )
            }
        </span>
    )
}

export default EditString