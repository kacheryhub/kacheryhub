import { Grid } from '@material-ui/core';
import { NodeId } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useCallback } from 'react';
import BoxButton from './BoxButton';
import usePage from './usePage';

type Props = {
    nodeId: NodeId
}

const CommonNodeActions: FunctionComponent<Props> = ({nodeId}) => {
    const {setPage} = usePage()

    const handleJoinChannel = useCallback(() => {
        setPage({
            page: 'joinChannel',
            nodeId
        })
    }, [setPage, nodeId])

    return (
        <div>
            <Grid container>
                <Grid item>
                    <BoxButton
                        label="Join a channel for this node"
                        onClick={handleJoinChannel}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default CommonNodeActions