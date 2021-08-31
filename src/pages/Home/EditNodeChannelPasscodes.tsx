import { IconButton } from '@material-ui/core'
import { Add, Delete } from '@material-ui/icons'
import { isPasscode, NodeChannelMembership, Passcode } from 'kachery-js/types/kacheryHubTypes'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import HidePasscode from './HidePasscode'

type Props = {
    nodeChannelMembership?: NodeChannelMembership
    onUpdateNodeChannelMembership?: (a: NodeChannelMembership) => void
}

const EditNodeChannelPasscodes: FunctionComponent<Props> = ({nodeChannelMembership, onUpdateNodeChannelMembership}) => {
    const a = nodeChannelMembership

    const [adding, setAdding] = useState<boolean>(false)
    const [editPasscode, setEditPasscode] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditPasscode(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        if (!nodeChannelMembership) return
        if (!isPasscode(editPasscode)) return
        if (((nodeChannelMembership || {}).channelPasscodes || []).includes(editPasscode)) return
        setEditPasscode('')
        const newNodeChannelMembership: NodeChannelMembership = {
            ...nodeChannelMembership,
            channelPasscodes: [...(nodeChannelMembership.channelPasscodes || []), editPasscode]
        }
        onUpdateNodeChannelMembership && onUpdateNodeChannelMembership(newNodeChannelMembership)
        setAdding(false)
    }, [editPasscode, onUpdateNodeChannelMembership, nodeChannelMembership])

    const handleDeletePasscode = useCallback((passcode: Passcode) => {
        if (!nodeChannelMembership) return
        if (!((nodeChannelMembership || {}).channelPasscodes || []).includes(passcode)) return
        const newNodeChannelMembership: NodeChannelMembership = {
            ...nodeChannelMembership,
            channelPasscodes: (nodeChannelMembership.channelPasscodes || []).filter(p => (p !== passcode))
        }
        onUpdateNodeChannelMembership && onUpdateNodeChannelMembership(newNodeChannelMembership)
        setAdding(false)
    }, [onUpdateNodeChannelMembership, nodeChannelMembership])

    const handleStartAdd = useCallback(() => {
        setAdding(true)
    }, [])

    const handleCancelAdd = useCallback(() => {
        setAdding(false)
    }, [])

    const validEditPasscode = useMemo(() => {
        if (!isPasscode(editPasscode)) return false
        if (((nodeChannelMembership || {}).channelPasscodes || []).includes(editPasscode)) return false
        return true
    }, [editPasscode, nodeChannelMembership])

    const channelPasscodes = useMemo(() => (
        (a || {}).channelPasscodes || []
    ), [a])
    const validChannelPasscodes = useMemo(() => (
        (a || {}).validChannelPasscodes || []
    ), [a])

    if (!a) return <span />
    return (
        <div style={{maxWidth: 500}}>
            <div>
                {
                    channelPasscodes.map(p => (
                        <span style={{color: validChannelPasscodes.includes(p) ? 'darkgreen' : 'darkred', background: 'lightgray', margin: 3, paddingBottom: 7, paddingTop: 4, whiteSpace: 'pre'}}>
                            <IconButton onClick={() => handleDeletePasscode(p)}><Delete /></IconButton>
                            <HidePasscode passcode={p} copyable={true} />
                        </span>
                    ))
                }
            </div>
            <div>
                {
                    adding ? (
                        <span>
                            <input type="text" value={editPasscode} onChange={handleChange} />
                            <button onClick={handleAdd} disabled={!validEditPasscode}>Add</button>
                            <button onClick={handleCancelAdd}>Cancel</button>
                        </span>
                    ) : (
                        onUpdateNodeChannelMembership ? (
                            <IconButton onClick={handleStartAdd} title="Add passcode"><Add /></IconButton>
                        ) : (<span />)
                    )
                }
            </div>
        </div>
    )
}

export default EditNodeChannelPasscodes