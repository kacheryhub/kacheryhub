import Ably from 'ably';
import { AblyTokenRequest, ChannelConfig, isAblyTokenRequest, NodeChannelAuthorization } from "../../src/common/types/kacheryHubTypes";

const createTokenRequestAsync = async (ably: Ably.Rest, tokenParams: Ably.Types.TokenParams): Promise<Ably.Types.TokenRequest> => {
    return new Promise((resolve, reject) => {
        ably.auth.createTokenRequest(tokenParams, null, (err, tokenRequest) => {
            if (err) reject(err)
            else resolve(tokenRequest)
        })
    })
}

const createAblyTokenRequest = async (channelConfig: ChannelConfig, authorization: NodeChannelAuthorization): Promise<AblyTokenRequest> => {
    const ablyApiKey = channelConfig.ablyApiKey
    if (!ablyApiKey) throw Error('No ably api key.')

    const ably = new Ably.Rest({ key: ablyApiKey });

    const cn = channelConfig.channelName
    const params: Ably.Types.TokenParams = {capability: {
        [`${cn}-requestFiles`]: [],
        [`${cn}-provideFiles`]: []
    }}
    if (authorization.permissions.requestFiles) {
        params.capability[`${cn}-requestFiles`].push('publish')
        params.capability[`${cn}-provideFiles`].push('subscribe')
    }
    if (authorization.permissions.provideFiles) {
        params.capability[`${cn}-requestFiles`].push('subscribe')
        params.capability[`${cn}-provideFiles`].push('publish')
    }
    const tokenRequest = await createTokenRequestAsync(ably, params)
    if (!isAblyTokenRequest(tokenRequest)) {
        throw Error('Invalid ably token request')
    }
    return tokenRequest
}

export default createAblyTokenRequest