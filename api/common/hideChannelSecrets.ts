import { ChannelConfig } from "../../src/common/types";

const hideChannelSecrets = (x: ChannelConfig) => {
    const ret: ChannelConfig = {
        channelName: x.channelName,
        ownerId: x.ownerId,
        bucketUri: x.bucketUri,
        googleServiceAccountCredentials: x.googleServiceAccountCredentials ? 'private' : undefined,
        ablyApiKey: x.ablyApiKey ? 'private' : undefined,
        deleted: x.deleted,
        authorizedNodes: x.authorizedNodes
    }
    return ret
}

export default hideChannelSecrets