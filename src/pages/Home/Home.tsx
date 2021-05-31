import React, { FunctionComponent } from 'react'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import ChannelListSection from './ChannelListSection'
import './Home.css'
import SignInSection from './SignInSection'
import NodeListSection from './NodeListSection'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    const signedIn = useSignedIn()
    return (
        <div>
            <h3>Welcome to kachery hub</h3>
            <p>Here you can create and manage kachery channels.</p>
            {/* <button onClick={handleGet}>Get</button>
            <button onClick={handleSet}>Set</button> */}
            <SignInSection />
            {
                signedIn && (
                    <span>
                        <ChannelListSection />
                        <NodeListSection />
                    </span>
                )
            }
        </div>
    )
}

export default Home