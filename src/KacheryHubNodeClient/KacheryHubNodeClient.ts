import axios from "axios"
import { publicKeyToHex, publicKeyHexToNodeId, getSignature } from "../common/types/crypto_util"
import { KeyPair } from "../common/types/kacheryTypes"
import {GetNodeConfigRequestBody, KacheryNodeRequest} from '../common/types/kacheryNodeRequestTypes'
import { isNodeConfig, NodeConfig } from "../common/types/kacheryHubTypes"

class KacheryHubNodeClient {
    #initialized = false
    #initializing = false
    #onInitializedCallbacks: (() => void)[] = []
    #nodeConfig: NodeConfig | undefined = undefined
    constructor(private opts: {keyPair: KeyPair, ownerId: string, kacheryHubUrl?: string}) {
    }
    async initialize() {
        if (this.#initialized) return
        if (this.#initializing) {
            return new Promise<void>((resolve) => {
                this.onInitialized(() => {
                    resolve()
                })
            })
        }
        this.#initializing = true

        const reqBody: GetNodeConfigRequestBody = {
            type: 'getNodeConfig',
            nodeId: this.nodeId,
            ownerId: this.opts.ownerId
        }
        const req: KacheryNodeRequest = {
            body: reqBody,
            nodeId: this.nodeId,
            signature: getSignature(reqBody, this.opts.keyPair)
        }
        const x = await axios.post(`${this._kacheryHubUrl()}/api/getNodeConfig`, req)
        const nodeConfig = x.data
        if (!isNodeConfig(nodeConfig)) {
            console.warn(nodeConfig)
            throw Error('Invalid node config')
        }
        this.#nodeConfig = nodeConfig

        this.#initialized = true
        this.#initializing = false
    }
    public get nodeConfig() {
        return this.#nodeConfig
    }
    public get nodeId() {
        return publicKeyHexToNodeId(publicKeyToHex(this.opts.keyPair.publicKey))
    }
    public get channelMemberships() {
        if (!this.#nodeConfig) return undefined
        return this.#nodeConfig.channelMemberships
    }
    onInitialized(callback: () => void) {
        this.#onInitializedCallbacks.push(callback)
    }
    _kacheryHubUrl() {
        return this.opts.kacheryHubUrl || 'https://kachery-hub.vercel.app'
    }
}

export default KacheryHubNodeClient