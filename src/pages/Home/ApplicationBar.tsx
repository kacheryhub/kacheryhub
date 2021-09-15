import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { FunctionComponent, useCallback } from 'react';
import { useSignedIn } from '../../commonInterface/googleSignIn/GoogleSignIn';
import useGoogleSignInClient from '../../commonInterface/googleSignIn/useGoogleSignInClient';
import usePage from './usePage';

type Props = {
    
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));


const ApplicationBar: FunctionComponent<Props> = () => {
    const classes = useStyles();
    const client = useGoogleSignInClient()
    const gapi = client?.gapi
    const {setPage} = usePage()

    const {signedIn} = useSignedIn()

    const handleLogin = useCallback(() => {
        gapi.auth2.getAuthInstance().signIn();
    }, [gapi])
    const handleLogout = useCallback(() => {
        gapi.auth2.getAuthInstance().signOut()
        setPage({page: 'home'})
    }, [gapi, setPage])
    const handleHome = useCallback(() => {
        setPage({page: 'home'})
    }, [setPage])
    return (
        <AppBar position="fixed">
            <Toolbar>
                <Typography variant="h6" className={classes.title} style={{cursor: 'pointer'}} onClick={handleHome}>
                    kacheryhub
                </Typography>
                {
                    client && (
                        signedIn ? (
                            <span>
                                <span style={{fontFamily: 'courier', color: 'lightgray'}}>{client.userId}</span>
                                <Button color="inherit" onClick={handleLogout}>Sign out</Button>
                            </span>
                        ) : (
                            <Button color="inherit" onClick={handleLogin}>Sign in</Button>
                        )
                    )
                }
                
            </Toolbar>
        </AppBar>
    )
}

export default ApplicationBar