import { IconButton } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import { NodeId } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink';

type Props = {
    nodeId: NodeId
    copyable?: boolean
    onClick?: () => void
}

const AbbreviatedNodeId: FunctionComponent<Props> = ({nodeId, onClick, copyable=true}) => {
    const [copyClicked, setCopyClicked] = useState<boolean>(false)
    const handleCopyClick = useCallback(() => {
        setCopyClicked(true)
    }, [])
    const handleFocusOut = useCallback(() => {
        setCopyClicked(false)
    }, [])
    const elmt = useMemo(() => (<span title={nodeId.toString()}>{nodeId.slice(0, 12)}...</span>), [nodeId])
    return (
        copyClicked ? (
            <input type="text" readOnly={true} onBlur={handleFocusOut} ref={(x) => x?.select()} value={nodeId.toString()} style={{maxWidth: 120}} />
        ) : (
            <span>
                {
                    copyable &&
                    <IconButton onClick={handleCopyClick}><Visibility /></IconButton>
                }
                {` `}
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

export default AbbreviatedNodeId