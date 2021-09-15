import { NodeId } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useEffect, useState } from 'react';
import ChannelPart from './ChannelPart';
import ChannelResourcesPart from './ChannelResourcesPart';
import CheckChannelMembershipPart from './CheckChannelMembershipPart';
import CheckChannelResourcesPart from './CheckChannelResourcesPart';
import CheckNodeRegisteredPart from './CheckNodeRegisteredPart';
import FigurlSetupPart from './FigurlSetupPart';
import NodePart from './NodePart';
import SignInPart from './SignInPart';
import WizardState from './WizardState';

type Props = {

}

const FigurlWizard: FunctionComponent<Props> = () => {
    const [wizardState, setWizardState] = useState<WizardState>({})
    useEffect(() => {
        if (!wizardState.nodeId) {
            setWizardState({...wizardState, nodeId: '9beb5d5023b1a05ac9b220c9567a7cf240dc00938a9b616277ca0cae9b13ca3d' as any as NodeId})
        }
    }, [wizardState, setWizardState])
    return (
        <div>
            <SignInPart state={wizardState} setState={setWizardState} />
            <NodePart state={wizardState} setState={setWizardState} />
            <CheckNodeRegisteredPart state={wizardState} setState={setWizardState} />
            <ChannelPart state={wizardState} setState={setWizardState} />
            <CheckChannelResourcesPart state={wizardState} setState={setWizardState} />
            <CheckChannelMembershipPart state={wizardState} setState={setWizardState} />
            <ChannelResourcesPart state={wizardState} setState={setWizardState} />
            <FigurlSetupPart state={wizardState} setState={setWizardState} />
        </div>
    )
}

export default FigurlWizard