import { Grid } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import BoxButton from './BoxButton';
import usePage from './usePage';

type Props = {

}

const CommonActionsSection: FunctionComponent<Props> = () => {
    const {setPage} = usePage()
    const handleRegisterNewNode = useCallback(() => {
        setPage({page: 'registerNode'})
    }, [setPage])
    const handleJoinChannel = useCallback(() => {
        setPage({page: 'joinChannel'})
    }, [setPage])
    const handleCreateChannel = useCallback(() => {
        setPage({page: 'createChannel'})
    }, [setPage])

    return (
        <div>
            <h2>Common actions</h2>
            <Grid container>
                <Grid item><BoxButton label="Register a new node" onClick={handleRegisterNewNode} /></Grid>
                <Grid item><BoxButton label="Join a channel" onClick={handleJoinChannel} /></Grid>
                <Grid item><BoxButton label="Create a channel" onClick={handleCreateChannel} /></Grid>
            </Grid>
        </div>
    )
}

export default CommonActionsSection