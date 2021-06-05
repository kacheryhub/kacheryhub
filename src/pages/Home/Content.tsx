import React, { FunctionComponent, useCallback } from 'react'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import { NodeId } from '../../common/types/kacheryTypes'
import ChannelListSection from './ChannelListSection'
import EditChannel from './EditChannel'
import EditNode from './EditNode'
import './Home.css'
import NodeListSection from './NodeListSection'
import SignInSection from './SignInSection'
import usePage from './usePage'

type Props = {
    
}

const Content: FunctionComponent<Props> = () => {
    const signedIn = useSignedIn()
    const {page, setPage} = usePage()

    const handleSelectNode = useCallback((nodeId: NodeId) => {
        setPage({page: 'node', nodeId})
    }, [setPage])

    const handleSelectChannel = useCallback((channelName: string) => {
        setPage({page: 'channel', channelName})
    }, [setPage])

    if (page.page === 'home') {
        return (
            <div>
                <h2>Welcome to kachery hub.</h2>
                <p>Here you can manage your kachery nodes and channels.</p>
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
                <EditNode
                    nodeId={page.nodeId}
                />
            </div>
        )
    }
    else if (page.page === 'channel') {
        return (
            <div>
                <EditChannel
                    channelName={page.channelName}
                />
            </div>
        )
    }
    else {
        return <span>Unexpected page</span>
    }    
}

export default Content