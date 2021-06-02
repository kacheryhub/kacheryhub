import React, { FunctionComponent, useEffect, useState } from 'react'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'

type Props = {
}

const SignInSection: FunctionComponent<Props> = () => {

    const googleSignInClient = useGoogleSignInClient()
    const signedIn = useSignedIn()
    const [googleSignInVisible, setGoogleSignInVisible] = useState(false)
    useEffect(() => {
        if ((signedIn) && (googleSignInVisible)) {
            // do this so that if we signed out, the big button will not be visible at first
            setGoogleSignInVisible(false)
        }
    }, [signedIn, googleSignInVisible])

    if (!googleSignInClient) return <span />
    return (
        <div className="SignInSection HomeSection">
            {
                signedIn ? (
                    <p>You are signed in as {googleSignInClient.profile?.getEmail()}</p>
                ) : (
                    <p>Sign in above to get started.</p>
                )
            }
        </div>
    )
}

export default SignInSection