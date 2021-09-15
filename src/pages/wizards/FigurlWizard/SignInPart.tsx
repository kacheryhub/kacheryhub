import { useSignedIn } from 'commonInterface/googleSignIn/GoogleSignIn';
import React, { FunctionComponent, useEffect } from 'react';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const SignInPart: FunctionComponent<Props> = ({setState}) => {
    const {signedIn, userId} = useSignedIn()

    useEffect(() => {
        if (!signedIn) {
            setState({})
        }
    }, [signedIn, setState])

    if (signedIn) {
        return <p>You are signed in as {userId}</p>
    }
    else {
        return <p>Start by signing in above.</p>
    }
}

export default SignInPart