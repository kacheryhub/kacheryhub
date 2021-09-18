import React, { FunctionComponent } from 'react';
import "./BoxButton.css"

type Props = {
    label: string
    onClick?: () => void
}


const BoxButton: FunctionComponent<Props> = ({label, onClick}) => {
    return (
        <div className="BoxButton" onClick={onClick}>
            {label}
        </div>
    )
}

export default BoxButton