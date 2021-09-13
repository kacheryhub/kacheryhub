import { Button, Icon } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { useSignedIn } from 'common/googleSignIn/GoogleSignIn';
import useNodesForUser from 'pages/Home/useNodesForUser';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const CheckNodeRegisteredPart: FunctionComponent<Props> = ({state, setState}) => {
    const {userId} = useSignedIn()
    const {nodesForUser, refreshNodesForUser} = useNodesForUser(userId)
    const nodeIsRegistered = useMemo(() => {
        if (!nodesForUser) return
        const a = nodesForUser.filter(n => (n.nodeId === state.nodeId))
        if (a.length > 0) return true
        else return false
    }, [nodesForUser, state.nodeId])
    useEffect(() => {
        if (nodeIsRegistered !== state.nodeIsRegistered) {
            setState({...state, nodeIsRegistered})
        }
    }, [state, setState, nodeIsRegistered])
    if (!state.nodeId) return <div />
    return (
        <div>
            {
                state.nodeIsRegistered ? (
                    <p><Icon><Check /></Icon> This node has been registered.</p>
                ) : (
                    <p>
                        This node has not been registered. Once you have
                        registered this node, click <Button onClick={refreshNodesForUser}>Refresh</Button>.
                    </p>
                )
            }
        </div>
    )
}

export default CheckNodeRegisteredPart