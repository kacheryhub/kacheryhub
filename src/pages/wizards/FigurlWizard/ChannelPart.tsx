import { ChannelName } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useCallback } from 'react';
import SubmitText from './SubmitText';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const ChannelPart: FunctionComponent<Props> = ({state, setState}) => {
    const handleSubmitChannelName = useCallback((channelName: string) => {
        setState({...state, channelName: channelName as any as ChannelName})
    }, [state, setState])
    if (!state.nodeIsRegistered) return <div />
    return (
        <div>
            <p>
                Create a channel or use an existing channel.
            </p>
            {
                state.channelName ? (
                    <div>
                        <p>You entered channel: {state.channelName}</p>
                    </div>
                ) : (
                    <p>Enter the name of the channel you wish to use: <SubmitText onSubmit={handleSubmitChannelName} /></p>
                )
            }
        </div>
    )
}

export default ChannelPart