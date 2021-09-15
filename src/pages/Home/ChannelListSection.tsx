import { IconButton } from '@material-ui/core'
import { AddCircle, Refresh } from '@material-ui/icons'
import { AddChannelRequest, ChannelConfig, DeleteChannelRequest, GetChannelsForUserRequest, isChannelConfig } from 'kacheryInterface/kacheryHubTypes'
import { ChannelName, isArrayOf, UserId } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import GoogleSignInClient from 'commonInterface/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from 'commonInterface/googleSignIn/useGoogleSignInClient'
import { default as kacheryHubApiRequest } from 'kacheryInterface/kacheryHubApiRequest'
import Hyperlink from 'commonInterface/commonComponents/Hyperlink/Hyperlink'
import MarkdownDialog from 'commonInterface/commonComponents/Markdown/MarkdownDialog'
import useVisible from 'commonInterface/commonComponents/useVisible'
import createKacheryChannelMd from '../../markdown/createKacheryChannel.md.gen'
import AddChannelControl from './AddChannelControl'
import ChannelsTable from './ChannelsTable'

type Props = {
    onSelectChannel: (channel: ChannelName) => void
}

const useChannelsForUser = (userId?: UserId | null) => {
    const channelsForUser = useRef<{[key: string]: ChannelConfig[]}>({})
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c + 1))}, [])
    useEffect(() => {
        if (!userId) return
        ;(async () => {
            delete channelsForUser.current[userId.toString()]
            incrementUpdateCode()
            const req: GetChannelsForUserRequest = {
                type: 'getChannelsForUser',
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const channels = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isArrayOf(isChannelConfig)(channels)) {
                console.warn('Invalid channels', channels)
                return
            }
            channelsForUser.current[userId.toString()] = channels
            incrementUpdateCode()
        })()
    }, [userId, googleSignInClient, refreshCode, incrementUpdateCode])
    return {channelsForUser: userId ? channelsForUser.current[userId.toString()] || undefined : undefined, refreshChannelsForUser: incrementRefreshCode}
}

const addChannel = async (channel: ChannelConfig, googleSignInClient: GoogleSignInClient) => {
    const req: AddChannelRequest = {
        type: 'addChannel',
        channel,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: true})
}

const deleteChannel = async (channelName: ChannelName, googleSignInClient: GoogleSignInClient) => {
    const req: DeleteChannelRequest = {
        type: 'deleteChannel',
        channelName,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    await kacheryHubApiRequest(req, {reCaptcha: false})
}

const ChannelListSection: FunctionComponent<Props> = ({onSelectChannel}) => {
    const googleSignInClient = useGoogleSignInClient()
    const {channelsForUser, refreshChannelsForUser} = useChannelsForUser(googleSignInClient?.userId)
    const [status, setStatus] = useState<'ready' | 'processing'>('ready')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const {visible: addingChannelVisible, show: showAddingChannel, hide: hideAddingChannel} = useVisible()

    const handleAddChannel = useCallback((channelName: ChannelName) => {
        if (!googleSignInClient) return
        const userId = googleSignInClient.userId
        if (!userId) return
        if (status !== 'ready') return
        hideAddingChannel()
        setStatus('processing')
        setErrorMessage('')
        const newChannel: ChannelConfig = {
            channelName,
            ownerId: userId
        }
        addChannel(newChannel, googleSignInClient).then(() => {
            refreshChannelsForUser()
            setStatus('ready')
        }).catch((err) => {
            setErrorMessage(err.message)
            setStatus('ready')
        })
    }, [refreshChannelsForUser, googleSignInClient, status, hideAddingChannel])

    const handleDeleteChannel = useCallback((channelName: ChannelName) => {
        if (!googleSignInClient) return
        const userId = googleSignInClient.userId
        if (!userId) return
        if (status !== 'ready') return
        setStatus('processing')
        setErrorMessage('')
        deleteChannel(channelName, googleSignInClient).then(() => {
            refreshChannelsForUser()
            setStatus('ready')
        }).catch((err) => {
            setErrorMessage(err.message)
            setStatus('ready')
        })
    }, [refreshChannelsForUser, googleSignInClient, status])

    const createKacheryChannelVisible = useVisible()

    return (
        <div>
            <h2>Your channels</h2>
            <p>
                These are channels hosted by you; you provide the cloud storage and network communication services.
                You can configure which nodes are allowed to belong to these channels in various roles.
            </p>

            <p><Hyperlink onClick={createKacheryChannelVisible.show}>How to create a kachery channel</Hyperlink></p>
            <MarkdownDialog
                visible={createKacheryChannelVisible.visible}
                onClose={createKacheryChannelVisible.hide}
                source={createKacheryChannelMd}
                linkTarget="_blank"
            />

            {
                (status === 'ready') && (
                    <span>
                        <IconButton onClick={refreshChannelsForUser} title="Refresh channels"><Refresh /></IconButton>
                        <IconButton onClick={showAddingChannel} title="Add kachery channel"><AddCircle /></IconButton>
                    </span>
                )
            }
            {
                ((status === 'ready') && (channelsForUser) && (addingChannelVisible)) ? (
                    <AddChannelControl onAddChannel={handleAddChannel} onCancel={hideAddingChannel} />
                ) : (
                    <span>{status === 'processing' && (<span>Processing...</span>)}</span>
                )
            }
            {
                errorMessage && (
                    <div style={{color: 'red'}}>{errorMessage}</div>
                )
            }
            {
                channelsForUser ? (
                    (channelsForUser && channelsForUser.length === 0) ? (
                        <div>You do not have any channels</div>
                    ) : (
                        <ChannelsTable channels={channelsForUser || []} onClickChannel={onSelectChannel} onDeleteChannel={(status === 'ready') ? handleDeleteChannel : undefined} />
                    )
                ) : (
                    <div>Loading...</div>
                )
            }
        </div>
    )
}

export default ChannelListSection