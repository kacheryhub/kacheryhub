import React, { useCallback } from 'react'
import { FunctionComponent } from "react"
import axios from 'axios'
import ChannelsConfig, { isChannelsConfig } from '../../common/ChannelsConfig'
import SignInSection from './SignInSection'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import './Home.css'
import ChannelListSection from './ChannelListSection'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    const googleSignInClient = useGoogleSignInClient()
    const handleGet = useCallback(() => {
        ;(async () => {
            const channelsConfig = (await axios.post('/api/getChannelsConfig', {})).data
            if (!isChannelsConfig(channelsConfig)) {
                console.warn(channelsConfig)
                throw Error('Invalid channels config')
            }
            console.log('--- channels config', channelsConfig)
        })()
        
    }, [])
    const handleSet = useCallback(() => {
        ;(async () => {
            const channelsConfig: ChannelsConfig = {
                channels: [{
                    channelName: 'channel1',
                    adminId: 'jmagland@flatironinstitute.org'
                }]
            }
            const result = (await axios.post('/api/setChannelsConfig', {
                googleIdToken: googleSignInClient?.idToken,
                config: channelsConfig
            })).data
            console.log('---', result)
        })()
    }, [googleSignInClient?.idToken])
    const signedIn = useSignedIn()
    return (
        <div>
            <h3>Welcome to kachery hub!</h3>
            <p>Here you can create and manage kachery channels.</p>
            {/* <button onClick={handleGet}>Get</button>
            <button onClick={handleSet}>Set</button> */}
            <SignInSection />
            {
                signedIn && (
                    <ChannelListSection />
                )
            }
        </div>
    )
}

export default Home