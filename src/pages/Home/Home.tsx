import React, { FunctionComponent, useCallback, useState } from 'react'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import { NodeId } from '../../common/kacheryTypes/kacheryTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import ChannelListSection from './ChannelListSection'
import EditChannel from './EditChannel'
import EditNode from './EditNode'
import './Home.css'
import NodeListSection from './NodeListSection'
import SignInSection from './SignInSection'

type Props = {
    
}

type Page = {
    page: 'home'
} | {
    page: 'node'
    nodeId: NodeId
} | {
    page: 'channel'
    channelName: string
}

const Home: FunctionComponent<Props> = () => {
    const signedIn = useSignedIn()
    const [page, setPage] = useState<Page>({page: 'home'})

    const handleSelectNode = useCallback((nodeId: NodeId) => {
        setPage({page: 'node', nodeId})
    }, [])

    const handleSelectChannel = useCallback((channelName: string) => {
        setPage({page: 'channel', channelName})
    }, [])

    const handleHome = useCallback(() => {
        setPage({page: 'home'})
    }, [])

    if (page.page === 'home') {
        return (
            <div style={{maxWidth: 1000}}>
                <h3>Welcome to kachery hub</h3>
                <p>Here you can manage your kachery nodes and channels.</p>
                {/* <button onClick={handleGet}>Get</button>
                <button onClick={handleSet}>Set</button> */}
                <SignInSection />
                {
                    signedIn && (
                        <span>
                            <NodeListSection onSelectNode={handleSelectNode} />
                            <ChannelListSection onSelectChannel={handleSelectChannel} />
                        </span>
                    )
                }
            </div>
        )
    }
    else if (page.page === 'node') {
        return (
            <div>
                <Hyperlink onClick={handleHome}>Back to home</Hyperlink>
                <br />
                {
                    <EditNode
                        nodeId={page.nodeId}
                    />
                }
            </div>
        )
    }
    else if (page.page === 'channel') {
        return (
            <div>
                <Hyperlink onClick={handleHome}>Back to home</Hyperlink>
                <br />
                {
                    <EditChannel
                        channelName={page.channelName}
                    />
                }
            </div>
        )
    }
    else {
        return <span>Unexpected page</span>
    }    
}

export default Home