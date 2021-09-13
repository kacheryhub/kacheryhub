import { Button, Icon } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import useNodeConfig from 'pages/Home/useNodeConfig';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const CheckChannelMembershipPart: FunctionComponent<Props> = ({state, setState}) => {
    const {nodeConfig, refreshNodeConfig} = useNodeConfig(state.nodeId)
    const nodeIsMemberOfChannel = useMemo(() => {
        if (!nodeConfig) return
        if (!state.channelName) return
        const channelMembership = (nodeConfig.channelMemberships || []).filter(cm => (cm.channelName === state.channelName))[0]
        return channelMembership ? true : false
    }, [nodeConfig, state.channelName])
    useEffect(() => {
        if (nodeIsMemberOfChannel !== state.nodeIsMemberOfChannel) {
            setState({...state, nodeIsMemberOfChannel})
        }
    }, [state, setState, nodeIsMemberOfChannel])
    if (!state.nodeIsRegistered) return <div />
    if (!state.channelName) return <div />
    if (!state.channelHasResources) return <div />
    if (!nodeConfig) {
        return <p>Unable to find node config.</p>
    }
    return (
        <div>
            {
                state.nodeIsMemberOfChannel ? (
                    <p><Icon><Check /></Icon> This node is a member of the {state.channelName} channel.</p>
                ) : (
                    <p>
                        This node is not a member of channel {state.channelName}. Once you have
                        added the node to the channel, click <Button onClick={refreshNodeConfig}>Refresh</Button>.
                    </p>
                )
            }
        </div>
    )
}

export default CheckChannelMembershipPart