import Ably from 'ably';
import { AblyTokenRequest, ChannelConfig, isAblyTokenRequest, NodeChannelAuthorization } from "../../src/kachery-js/types/kacheryHubTypes";

const createTokenRequestAsync = async (ably: Ably.Rest, tokenParams: Ably.Types.TokenParams): Promise<Ably.Types.TokenRequest> => {
    return new Promise((resolve, reject) => {
        ably.auth.createTokenRequest(tokenParams, undefined, (err, tokenRequest) => {
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
    const capability: {[key: string]: any[]} = {
        [`${cn}-requestFiles`]: [],
        [`${cn}-provideFiles`]: [],
        [`${cn}-requestFeeds`]: [],
        [`${cn}-provideFeeds`]: [],
        [`${cn}-requestTasks`]: [],
        [`${cn}-provideTasks`]: []
    }
    if (authorization.permissions.requestFiles) {
        capability[`${cn}-requestFiles`].push('publish')
        capability[`${cn}-provideFiles`].push('subscribe')
    }
    if (authorization.permissions.provideFiles) {
        capability[`${cn}-requestFiles`].push('subscribe')
        capability[`${cn}-provideFiles`].push('publish')
    }
    if (authorization.permissions.requestFeeds) {
        capability[`${cn}-requestFeeds`].push('publish')
        capability[`${cn}-provideFeeds`].push('subscribe')
    }
    if (authorization.permissions.provideFeeds) {
        capability[`${cn}-requestFeeds`].push('subscribe')
        capability[`${cn}-provideFeeds`].push('publish')
    }
    if (authorization.permissions.requestTasks) {
        capability[`${cn}-requestTasks`].push('publish')
        capability[`${cn}-provideTasks`].push('subscribe')
    }
    if (authorization.permissions.provideTasks) {
        capability[`${cn}-requestTasks`].push('subscribe')
        capability[`${cn}-provideTasks`].push('publish')
    }
    for (let k in capability) {
        if (capability[k].length === 0) {
            delete capability[k]
        }
    }
    const params: Ably.Types.TokenParams = {capability}
    const tokenRequest = await createTokenRequestAsync(ably, params)
    if (!isAblyTokenRequest(tokenRequest)) {
        throw Error('Invalid ably token request')
    }
    return tokenRequest
}

export default createAblyTokenRequest