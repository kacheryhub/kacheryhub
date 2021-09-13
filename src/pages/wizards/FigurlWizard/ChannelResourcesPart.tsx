import React, { FunctionComponent } from 'react';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const ChannelResourcesPart: FunctionComponent<Props> = ({setState}) => {
    return <div />
}

export default ChannelResourcesPart