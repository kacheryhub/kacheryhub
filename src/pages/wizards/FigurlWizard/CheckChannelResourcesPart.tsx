import { Button, Icon } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import useChannelConfig from 'pages/Home/useChannelConfig';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const CheckChannelResourcesPart: FunctionComponent<Props> = ({state, setState}) => {
    const {channelConfig, refreshChannelConfig} = useChannelConfig(state.channelName)
    const channelHasResources = useMemo(() => {
        if (!channelConfig) return false
        return ((channelConfig.bitwooderResourceId ? true : false) && (channelConfig.bitwooderResourceKey ? true : false))
    }, [channelConfig])
    useEffect(() => {
        if (channelHasResources !== state.channelHasResources) {
            setState({...state, channelHasResources})
        }
    }, [state, setState, channelHasResources])
    if (!state.channelName) return <div />
    if (!channelConfig) {
        return <p>Unable to find channel. Once you have created the channel, click <Button onClick={refreshChannelConfig}>Refresh</Button>.</p>
    }
    return (
        <div>
            {
                state.channelHasResources ? (
                    <p><Icon><Check /></Icon> Channel {state.channelName} has attached resources.</p>
                ) : (
                    <p>
                        Channel {state.channelName} does not have attached resources. Once you have
                        attached resources to this channel, click <Button onClick={refreshChannelConfig}>Refresh</Button>.
                    </p>
                )
            }
        </div>
    )
}

export default CheckChannelResourcesPart