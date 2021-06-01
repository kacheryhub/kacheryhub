import React, { FunctionComponent, useMemo, useState } from 'react'
import { useSignedIn } from '../../common/googleSignIn/GoogleSignIn'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { NodeId } from '../../common/kacheryTypes/kacheryTypes'
import ChannelListSection from './ChannelListSection'
import EditNode from './EditNode'
import './Home.css'
import NodeListSection from './NodeListSection'
import SignInSection from './SignInSection'
import useNodesForUser from './useNodesForUser'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    const signedIn = useSignedIn()
    const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null)
    const googleSignInClient = useGoogleSignInClient()
    const {nodesForUser, refreshNodesForUser} = useNodesForUser(googleSignInClient?.userId)

    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return undefined
        return (nodesForUser || []).filter(n => (n.nodeId === selectedNodeId))[0]
    }, [selectedNodeId, nodesForUser])

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
                        <NodeListSection nodes={nodesForUser} onRefreshNodes={refreshNodesForUser} onSelectNode={setSelectedNodeId} />
                        {
                            selectedNode && (
                                <EditNode
                                    node={selectedNode}
                                    onRefreshNeeded={refreshNodesForUser}
                                />
                            )
                        }
                        <ChannelListSection />
                    </span>
                )
            }
        </div>
    )
}

export default Home