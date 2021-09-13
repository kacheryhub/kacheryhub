import { Button } from '@material-ui/core';
import React, { FunctionComponent } from 'react';

type Props = {
    onResponse: (response: boolean) => void
}

const YesNoQuestion: FunctionComponent<Props> = ({onResponse, children}) => {
    return (
        <div>
            <p>{children}</p>
            <Button onClick={() => {onResponse(true)}}>Yes</Button>
            <Button onClick={() => {onResponse(false)}}>No</Button>
        </div>
    )
}

export default YesNoQuestion