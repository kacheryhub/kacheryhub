import { useSignedIn } from 'common/googleSignIn/GoogleSignIn';
import { NodeId } from 'kachery-js/types/kacheryTypes';
import React, { FunctionComponent, useCallback } from 'react';
import SubmitText from './SubmitText';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const NodePart: FunctionComponent<Props> = ({state, setState}) => {
    const {signedIn, userId} = useSignedIn()
    const handleSubmitNodeId = useCallback((nodeId: string) => {
        setState({...state, nodeId: nodeId as any as NodeId})
    }, [state, setState])
    if (!signedIn) return <div />
    return (
        <div>
            <p>
                Run a kachery node on your local machine
                with the --owner {userId} option.
            </p>
            {
                state.nodeId ? (
                    <div>
                        <p>You entered node ID: {state.nodeId}</p>
                    </div>
                ) : (
                    <p>Enter the node ID of your running node: <SubmitText onSubmit={handleSubmitNodeId} /></p>
                )
            }
        </div>
    )
}

export default NodePart