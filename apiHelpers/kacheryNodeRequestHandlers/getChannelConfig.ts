import { GetChannelConfigRequestBody, GetChannelConfigResponse } from "../../src/kacheryInterface/kacheryNodeRequestTypes"
import { NodeId } from "../../src/commonInterface/kacheryTypes"
import hideChannelSecrets from "../common/hideChannelSecrets"
import loadChannelConfig from "../common/loadChannelConfig"

const getChannelConfigHandler = async (request: GetChannelConfigRequestBody, verifiedNodeId: NodeId): Promise<GetChannelConfigResponse> => {
    const { channelName } = request
    const channelConfig = await loadChannelConfig({channelName})
    return {
        found: true,
        channelConfig: hideChannelSecrets(channelConfig, {hidePasscodes: true})
    }
}

export default getChannelConfigHandler