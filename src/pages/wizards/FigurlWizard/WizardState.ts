import { ChannelName, NodeId } from "kachery-js/types/kacheryTypes"

type WizardState = {
    isRunningDaemon?: boolean
    nodeId?: NodeId
    nodeIsRegistered?: boolean
    channelName?: ChannelName
    channelHasResources?: boolean
    nodeIsMemberOfChannel?: boolean
}

export default WizardState