import { createKeyPair, hexToPrivateKey, hexToPublicKey, privateKeyToHex, publicKeyToHex, signMessage } from '../../src/commonInterface/crypto/signatures';
import { ChannelConfig, NodeChannelAuthorization } from "../../src/kacheryInterface/kacheryHubTypes";
import { isPrivateKeyHex, isPublicKeyHex, JSONValue, PrivateKeyHex } from '../../src/commonInterface/kacheryTypes';
import BitwooderDelegationCert from '../../src/bitwooderInterface/BitwooderDelegationCert';

const minuteMsec = 1000 * 60

const createBitwooderCert = async (channelConfig: ChannelConfig, authorization: NodeChannelAuthorization): Promise<{cert: BitwooderDelegationCert, key: PrivateKeyHex}> => {
    const bitwooderResourceId = channelConfig.bitwooderResourceId
    const bitwooderResourceKey = channelConfig.bitwooderResourceKey
    if (!bitwooderResourceId) throw Error(`No bitwooder resource ID for channel: ${channelConfig.channelName}`)
    if (!bitwooderResourceKey) throw Error(`No bitwooder resource key for channel: ${channelConfig.channelName}`)
    if (!isPublicKeyHex(bitwooderResourceId)) throw Error(`Invalid bitwooder resource ID for channel: ${channelConfig.channelName}`)
    if (!isPrivateKeyHex(bitwooderResourceKey)) throw Error(`Invalid bitwooder resource key for channel: ${channelConfig.channelName}`)

    const cn = channelConfig.channelName
    const ablyCapability: {[key: string]: any[]} = {
        [`${cn}-requestFiles`]: [],
        [`${cn}-provideFiles`]: [],
        [`${cn}-requestFeeds`]: [],
        [`${cn}-provideFeeds`]: [],
        [`${cn}-requestTasks`]: [],
        [`${cn}-provideTasks`]: []
    }
    if (authorization.permissions.requestFiles) {
        ablyCapability[`${cn}-requestFiles`].push('publish')
        ablyCapability[`${cn}-provideFiles`].push('subscribe')
    }
    if (authorization.permissions.provideFiles) {
        ablyCapability[`${cn}-requestFiles`].push('subscribe')
        ablyCapability[`${cn}-provideFiles`].push('publish')
    }
    if (authorization.permissions.requestFeeds) {
        ablyCapability[`${cn}-requestFeeds`].push('publish')
        ablyCapability[`${cn}-provideFeeds`].push('subscribe')
    }
    if (authorization.permissions.provideFeeds) {
        ablyCapability[`${cn}-requestFeeds`].push('subscribe')
        ablyCapability[`${cn}-provideFeeds`].push('publish')
    }
    if (authorization.permissions.requestTasks) {
        ablyCapability[`${cn}-requestTasks`].push('publish')
        ablyCapability[`${cn}-provideTasks`].push('subscribe')
    }
    if (authorization.permissions.provideTasks) {
        ablyCapability[`${cn}-requestTasks`].push('subscribe')
        ablyCapability[`${cn}-provideTasks`].push('publish')
    }
    for (let k in ablyCapability) {
        if (ablyCapability[k].length === 0) {
            delete ablyCapability[k]
        }
    }

    const attributes = {
        ablyCapability
    }

    const {privateKey, publicKey} = await createKeyPair()
    const delegatedSignerId = publicKeyToHex(publicKey)

    const payload = {
        expires: Date.now() + minuteMsec * 5,
        attributes,
        delegatedSignerId
    }
    const auth = {
        signerId: bitwooderResourceId,
        signature: await signMessage(payload as any as JSONValue, {
            privateKey: hexToPrivateKey(bitwooderResourceKey),
            publicKey: hexToPublicKey(bitwooderResourceId)
        })
    }
    const cert: BitwooderDelegationCert = {
        payload,
        auth
    }
    
    return {cert, key: privateKeyToHex(privateKey)}
}

export default createBitwooderCert