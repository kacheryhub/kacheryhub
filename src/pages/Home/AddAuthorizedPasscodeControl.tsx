import React, { FunctionComponent, useCallback, useState } from 'react'
import { ChannelName } from 'kachery-js/types/kacheryTypes'
import randomAlphaString from 'kachery-js/util/randomAlphaString'

type Props = {
    channelName: ChannelName
    onAddAuthorizedPasscode: (channelName: ChannelName, passcode: string) => void
    onCancel: () => void
}

const AddAuthorizedPasscodeControl: FunctionComponent<Props> = ({channelName, onAddAuthorizedPasscode, onCancel}) => {
    const [editPasscodePrefix, setEditPasscodePrefix] = useState<string>('')
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setEditPasscodePrefix(e.target.value)
    }, [])
    const handleAdd = useCallback(() => {
        setEditPasscodePrefix('')
        onAddAuthorizedPasscode(channelName, editPasscodePrefix + '-' + randomAlphaString(8))
    }, [channelName, editPasscodePrefix, onAddAuthorizedPasscode])
    return (
        <div>
            <span>
                <span>Passcode prefix: </span>
                <input type="text" value={editPasscodePrefix} onChange={handleChange} />
                <button onClick={handleAdd}>Add</button>
                <button onClick={onCancel}>Cancel</button>
            </span>
        </div>
    )
}

export default AddAuthorizedPasscodeControl