import { GetChannelConfigRequestBody, GetChannelConfigResponse } from "../../src/common/types/kacheryNodeRequestTypes"
import { NodeId } from "../../src/common/types/kacheryTypes"
import hideChannelSecrets from "../common/hideChannelSecrets"
import loadChannelConfig from "../common/loadChannelConfig"

const getChannelConfigHandler = async (request: GetChannelConfigRequestBody, verifiedNodeId: NodeId): Promise<GetChannelConfigResponse> => {
    const { channelName } = request
    const channelConfig = await loadChannelConfig({channelName})
    return {
        found: true,
        channelConfig: hideChannelSecrets(channelConfig)
    }
}

export default getChannelConfigHandler