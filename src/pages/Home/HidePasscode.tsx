import { IconButton } from '@material-ui/core';
import { FiberManualRecord } from '@material-ui/icons';
import { Passcode } from 'kachery-js/types/kacheryHubTypes';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink';

type Props = {
    passcode: Passcode
    onClick?: () => void
    copyable?: boolean
}

const HidePasscode: FunctionComponent<Props> = ({passcode, onClick, copyable}) => {
    const [copyClicked, setCopyClicked] = useState<boolean>(false)
    const handleCopyClick = useCallback(() => {
        setCopyClicked(true)
    }, [])
    const handleFocusOut = useCallback(() => {
        setCopyClicked(false)
    }, [])
    const elmt = useMemo(() => (<span title={passcode.toString()}>{passcode.slice(0, 6)}...</span>), [passcode])
    if (!copyable) return elmt
    return (
        copyClicked ? (
            <input type="text" readOnly={true} onBlur={handleFocusOut} ref={(x) => x?.select()} value={passcode.toString()} style={{maxWidth: 120}} />
        ) : (
            <span>
                <IconButton onClick={handleCopyClick}><FiberManualRecord /></IconButton>
                {
                    onClick ? (
                        <Hyperlink onClick={onClick}>
                            {elmt}
                        </Hyperlink>
                    ) : (
                        elmt
                    )
                }
            </span>
        )
    )
}

export default HidePasscode