import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import { isNodeId, NodeId } from '../../common/kacheryTypes/kacheryTypes'
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

const usePage = () => {
    const location = useLocation()
    const history = useHistory()
    const page: Page = useMemo(() => {
        const p = location.pathname.split('/')
        if (p[1] === 'node') {
            const nodeId = p[2]
            if (isNodeId(nodeId)) {
                return {
                    page: 'node',
                    nodeId
                }
            }
        }    
        else if (p[1] === 'channel') {
            const channelName = p[2]
            return {
                page: 'channel',
                channelName
            }
        }
        return {
            page: 'home'
        }
    }, [location])
    const setPage = useCallback((page: Page) => {
        if (page.page === 'node') {
            history.push({
                ...location,
                pathname: `/node/${page.nodeId}`
            })
        }
        else if (page.page === 'channel') {
            history.push({
                ...location,
                pathname: `/channel/${page.channelName}`
            })
        }
        else {
            history.push({
                ...location,
                pathname: '/home'
            })
        }
    }, [history, location])
    
    
    return useMemo(() => ({page, setPage}), [page, setPage])
}

const Home: FunctionComponent<Props> = () => {
    const signedIn = useSignedIn()
    const {page, setPage} = usePage()

    const handleSelectNode = useCallback((nodeId: NodeId) => {
        setPage({page: 'node', nodeId})
    }, [setPage])

    const handleSelectChannel = useCallback((channelName: string) => {
        setPage({page: 'channel', channelName})
    }, [setPage])

    const handleHome = useCallback(() => {
        setPage({page: 'home'})
    }, [setPage])

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