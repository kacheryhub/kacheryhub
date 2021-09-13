import React, { FunctionComponent } from 'react';
import WizardState from './WizardState';

type Props = {
    state: WizardState
    setState: (state: WizardState) => void
}

const FigurlSetupPart: FunctionComponent<Props> = ({setState}) => {
    return <div />
}

export default FigurlSetupPart