import CreateChannelPage from 'pages/CreateChannelPage/CreateChannelPage'
import HomePage from 'pages/HomePage/HomePage'
import FigurlWizard from 'pages/wizards/FigurlWizard/FigurlWizard'
import React, { FunctionComponent } from 'react'
import EditChannel from './EditChannel'
import EditNode from './EditNode'
import './Home.css'
import JoinChannelPage from './JoinChannelPage'
import NodeChannelMembershipPage from './NodeChannelMembershipPage'
import RegisterNodePage from './RegisterNodePage'
import usePage from './usePage'

type Props = {
    
}

const Content: FunctionComponent<Props> = () => {
    const {page} = usePage()

    if (page.page === 'home') {
        return (
            <HomePage />
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
    else if (page.page === 'createChannel') {
        return (
            <div>
                <CreateChannelPage
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
    else if (page.page === 'figurlWizard') {
        return (
            <div>
                <FigurlWizard />
            </div>
        )
    }
    else {
        return <span>Unexpected page</span>
    }    
}

export default Content