import logger from "winston"
import { BitwooderResourceRequest, BitwooderResourceResponse } from '../../bitwooderInterface/BitwooderResourceRequest'
import { ByteCount, ChannelName, FeedId, FileKey, isArrayOf, isString, JSONValue, NodeId, NodeLabel, Sha1Hash, Signature, SubfeedHash, SubfeedPosition, UserId } from '../../commonInterface/kacheryTypes'
import FeedManager from '../feeds/FeedManager'
import FileUploader, { SignedFileUploadUrlCallback } from '../FileUploader/FileUploader'
import { KacheryNodeRequestBody } from '../kacheryNodeRequestTypes'
import { KacheryHubPubsubMessageBody } from '../pubsubMessages'
import { KacheryStorageManagerInterface, LocalFeedManagerInterface, MutableManagerInterface } from './ExternalInterface'
import { getStats, GetStatsOpts } from './getStats'
import KacheryHubInterface from './KacheryHubInterface'
import NodeStats from './NodeStats'

export interface KacheryNodeOpts {
    kacheryHubUrl: string
    bitwooderUrl: string
    verifySubfeedMessageSignatures: boolean
}

class KacheryNode {
    #nodeId: NodeId
    #feedManager: FeedManager
    #mutableManager: MutableManagerInterface
    #kacheryStorageManager: KacheryStorageManagerInterface
    #stats = new NodeStats()
    #clientAuthCode = {current: '', previous: ''}
    #otherClientAuthCodes: string[] = []
    #kacheryHubInterface: KacheryHubInterface
    #fileUploader: FileUploader
    constructor(private p: {
        verbose: number,
        nodeId: NodeId,
        sendKacheryNodeRequest: (requestBody: KacheryNodeRequestBody) => Promise<JSONValue>,
        sendBitwooderResourceRequest: (request: BitwooderResourceRequest) => Promise<BitwooderResourceResponse>,
        signPubsubMessage: (messageBody: KacheryHubPubsubMessageBody) => Promise<Signature>,
        label: NodeLabel,
        ownerId?: UserId,
        kacheryStorageManager: KacheryStorageManagerInterface,
        mutableManager: MutableManagerInterface,
        localFeedManager: LocalFeedManagerInterface,
        additionalChannels: ChannelName[],
        opts: KacheryNodeOpts
    }) {
        this.#nodeId = p.nodeId
        this.#kacheryStorageManager = p.kacheryStorageManager
        this.#mutableManager = p.mutableManager

        this._updateOtherClientAuthCodes()
        this.#mutableManager.onSet((k: JSONValue) => {
            if (k === '_other_client_auth_codes') {
                this._updateOtherClientAuthCodes()
            }
        })

        this.#kacheryHubInterface = new KacheryHubInterface({
            nodeId: this.#nodeId,
            sendKacheryNodeRequest: p.sendKacheryNodeRequest,
            sendBitwooderResourceRequest: p.sendBitwooderResourceRequest,
            signPubsubMessage: p.signPubsubMessage,
            ownerId: p.ownerId,
            nodeLabel: p.label,
            kacheryHubUrl: p.opts.kacheryHubUrl,
            bitwooderUrl: p.opts.bitwooderUrl,
            nodeStats: this.#stats,
            additionalChannels: p.additionalChannels
        })

        this.#kacheryHubInterface.onIncomingFileRequest(({fileKey, channelName, fromNodeId}) => {
            this._handleIncomingFileRequest({fileKey, channelName, fromNodeId})
        })

        this.#kacheryHubInterface.onIncomingSubfeedSubscription((channelName: ChannelName, feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition) => {
            ;(async () => {
                if (!this.#feedManager.hasWriteableFeed(feedId)) return
                const sf = await this.#feedManager._loadSubfeed(feedId, subfeedHash, '*local*')
                sf.handleIncomingSubscription(channelName, position)
            })()
        })

        this.#kacheryHubInterface.onNewSubfeedMessages((channelName, feedId, subfeedHash, messages) => {
            ;(async () => {
                if (!this.#feedManager.hasLoadedSubfeed(channelName, feedId, subfeedHash)) {
                    return
                }
                const sf = await this.#feedManager._loadSubfeed(feedId, subfeedHash, channelName)
                sf.reportReceivedUpdateFromRemote()
                sf.addSignedMessages(messages)
            })()
        })
        this.#kacheryHubInterface.onNumSubfeedMessagesUploaded((channelName, feedId, subfeedHash, numUploadedMessages) => {
            ;(async () => {
                if (!this.#feedManager.hasLoadedSubfeed(channelName, feedId, subfeedHash)) {
                    return
                }
                const sf = await this.#feedManager._loadSubfeed(feedId, subfeedHash, channelName)
                sf.reportReceivedUpdateFromRemote()
                sf.downloadMessages(numUploadedMessages)
            })()
        })

        const signedFileUploadUrlCallback: SignedFileUploadUrlCallback = async (a: {channelName: ChannelName, sha1: Sha1Hash, size: ByteCount}) => {
            return await this.#kacheryHubInterface.createSignedFileUploadUrl(a)
        }

        this.#fileUploader = new FileUploader(signedFileUploadUrlCallback, this.#kacheryStorageManager, this.#stats)

        // The feed manager -- each feed is a collection of append-only logs
        this.#feedManager = new FeedManager(this.#kacheryHubInterface, p.localFeedManager, this.#stats)
    }
    nodeId() {
        return this.#nodeId
    }
    kacheryStorageManager() {
        return this.#kacheryStorageManager
    }
    stats() {
        return this.#stats
    }
    cleanup() {
    }
    feedManager() {
        return this.#feedManager
    }
    mutableManager() {
        return this.#mutableManager
    }
    getStats(o: GetStatsOpts) {
        return getStats(this, o)
    }
    nodeLabel() {
        return this.p.label
    }
    ownerId() {
        return this.p.ownerId
    }
    setClientAuthCode(code: string, previousCode: string) {
        this.#clientAuthCode = {
            current: code,
            previous: previousCode
        }
    }
    verifyClientAuthCode(code: string, opts: {browserAccess: boolean}) {
        if (code === this.#clientAuthCode.current) return true
        if ((this.#clientAuthCode.previous) && (code === this.#clientAuthCode.previous)) return true
        logger.warn(`Incorrect client auth code: ${code} <> ${this.#clientAuthCode.current} ${this.#clientAuthCode.current}`)
        if (!opts.browserAccess) {
            return false
        }
        if (this.#otherClientAuthCodes.includes(code)) return true
        return false
    }
    kacheryHubInterface() {
        return this.#kacheryHubInterface
    }
    async _updateOtherClientAuthCodes() {
        const x = await this.#mutableManager.get('_other_client_auth_codes')
        if (x) {
            const v = x.value
            if ((isArrayOf(isString))(v)) {
                this.#otherClientAuthCodes = v as string[]
            }
        }
    }
    async _handleIncomingFileRequest(args: {fileKey: FileKey, channelName: ChannelName, fromNodeId: NodeId}) {
        const x = await this.#kacheryStorageManager.findFile(args.fileKey)
        if (x.found) {
            this.#kacheryHubInterface.sendUploadFileStatusMessage({channelName: args.channelName, fileKey: args.fileKey, status: 'started'})
            // todo: use pending status and only upload certain number at a time
            await this.#fileUploader.uploadFileToBucket({channelName: args.channelName, fileKey: args.fileKey, fileSize: x.size})
            this.#kacheryHubInterface.sendUploadFileStatusMessage({channelName: args.channelName, fileKey: args.fileKey, status: 'finished'})
        }
    }
}

export default KacheryNode
