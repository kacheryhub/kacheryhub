import { ChannelConfig } from "../../src/kacheryInterface/kacheryHubTypes";

const hideChannelSecrets = (x: ChannelConfig, opts: {hidePasscodes: boolean}) => {
    const ret: ChannelConfig = {
        channelName: x.channelName,
        ownerId: x.ownerId,
        bitwooderResourceId: x.bitwooderResourceId,
        bitwooderResourceKey: x.bitwooderResourceKey ? '*private*' : undefined,
        bucketBaseUrl: x.bucketBaseUrl,
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