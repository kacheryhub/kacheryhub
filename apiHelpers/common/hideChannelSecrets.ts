import { ChannelConfig } from "../../src/kachery-js/types/kacheryHubTypes";

const hideChannelSecrets = (x: ChannelConfig, opts: {hidePasscodes: boolean}) => {
    const ret: ChannelConfig = {
        channelName: x.channelName,
        ownerId: x.ownerId,
        bucketUri: x.bucketUri,
        googleServiceAccountCredentials: x.googleServiceAccountCredentials ? '*private*' : undefined,
        ablyApiKey: x.ablyApiKey ? '*private*' : undefined,
        deleted: x.deleted,
        authorizedNodes: x.authorizedNodes,
        authorizedPasscodes: opts.hidePasscodes ? undefined : x.authorizedPasscodes
    }
    return ret
}

export default hideChannelSecrets