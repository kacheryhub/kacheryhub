import React, { FunctionComponent } from 'react';
import "./BoxButton.css"

type Props = {
    label: string
    onClick?: () => void
}


const BoxButton: FunctionComponent<Props> = ({label, onClick}) => {
    return (
        <div className="BoxButton" onClick={onClick}>
            <h2>{label}</h2>
        </div>
    )
}

export default BoxButton