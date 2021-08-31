import React, { FunctionComponent, useCallback } from 'react'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import { ChannelName, NodeId } from 'kachery-js/types/kacheryTypes'
import ChannelListSection from './ChannelListSection'
import EditChannel from './EditChannel'
import EditNode from './EditNode'
import './Home.css'
import NodeListSection from './NodeListSection'
import SignInSection from './SignInSection'
import usePage from './usePage'
import CommonActionsSection from './CommonActionsSection'
import RegisterNodePage from './RegisterNodePage'
import JoinChannelPage from './JoinChannelPage'
import NodeChannelMembershipPage from './NodeChannelMembershipPage'

type Props = {
    
}

const Content: FunctionComponent<Props> = () => {
    const signedIn = useSignedIn()
    const {page, setPage} = usePage()

    const handleSelectNode = useCallback((nodeId: NodeId) => {
        setPage({page: 'node', nodeId})
    }, [setPage])

    const handleSelectChannel = useCallback((channelName: ChannelName) => {
        setPage({page: 'channel', channelName})
    }, [setPage])

    if (page.page === 'home') {
        return (
            <div>
                <h2>Welcome to kacheryhub.</h2>
                <p><a href="https://github.com/kacheryhub/kachery-doc/blob/main/README.md" rel="noreferrer" target="_blank">Read about kachery</a></p>
                <p>Here you can manage your kachery nodes and channels.</p>
                <SignInSection />
                {
                    signedIn && (
                        <span>
                            <CommonActionsSection />
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
    else if (page.page === 'registerNode') {
        return (
            <div>
                <RegisterNodePage
                />
            </div>
        )
    }
    else if (page.page === 'joinChannel') {
        return (
            <div>
                <JoinChannelPage
                    nodeId={page.nodeId}
                />
            </div>
        )
    }
    else if (page.page === 'nodeChannelMembership') {
        return (
            <div>
                <NodeChannelMembershipPage
                    nodeId={page.nodeId}
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