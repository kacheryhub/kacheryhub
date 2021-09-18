import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { ChannelName } from 'commonInterface/kacheryTypes';
import AllChannelListSection from 'pages/Home/AllChannelListSection';
import SignInSection from 'pages/Home/SignInSection';
import usePage from 'pages/Home/usePage';
import useUserConfig from 'pages/Home/useUserConfig';
import React, { FunctionComponent, useCallback } from 'react';
import ChannelsPart from './ChannelsPart';
import NodesPart from './NodesPart';

type Props = {

}

const HomePage: FunctionComponent<Props> = () => {
    const {signedIn} = useSignedIn()
    const {setPage} = usePage()
    const userConfig = useUserConfig()

    const handleSelectChannel = useCallback((channelName: ChannelName) => {
        setPage({page: 'channel', channelName})
    }, [setPage])

    const isAdmin = userConfig && userConfig.admin

    return (
        <div>
            <h2>Welcome to kacheryhub</h2>
            <p><a href="https://github.com/kacheryhub/kachery-doc/blob/main/README.md" rel="noreferrer" target="_blank">Read about kachery</a></p>
            <p>Here you can manage your kachery nodes and channels.</p>
            <SignInSection />
            {
                signedIn && (
                    <NodesPart />
                )
            }
            {
                signedIn && (
                    <ChannelsPart />
                )
            }
            {
                signedIn && isAdmin && (
                    <AllChannelListSection onSelectChannel={handleSelectChannel} />
                )
            }
        </div>
    )
}

export default HomePage