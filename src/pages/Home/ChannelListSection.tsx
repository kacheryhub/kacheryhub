import { IconButton } from '@material-ui/core'
import { AddCircle, Refresh } from '@material-ui/icons'
import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { isArrayOf } from '../../common/kacheryTypes/kacheryTypes'
import { AddChannelRequest, ChannelConfig, DeleteChannelRequest, GetChannelsForUserRequest, isChannelConfig } from '../../common/types'
import useVisible from '../../commonComponents/useVisible'
import AddChannelControl from './AddChannelControl'
import ChannelsTable from './ChannelsTable'

type Props = {
    onSelectChannel: (channel: string) => void
}

const useChannelsForUser = (userId?: string | null) => {
    const channelsForUser = useRef<{[key: string]: ChannelConfig[]}>({})
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c + 1))}, [])
    useEffect(() => {
        if (!userId) return
        ;(async () => {
            delete channelsForUser.current[userId]
            incrementUpdateCode()
            const req: GetChannelsForUserRequest = {
                userId,
                auth: {
                    userId: googleSignInClient?.userId || undefined,
                    googleIdToken: googleSignInClient?.idToken || undefined
                }
            }
            const channels = (await axios.post('/api/getChannelsForUser', req)).data
            if (!isArrayOf(isChannelConfig)(channels)) {
                console.warn('Invalid channels', channels)
                return
            }
            channelsForUser.current[userId] = channels
            incrementUpdateCode()
        })()
    }, [userId, googleSignInClient, refreshCode, incrementUpdateCode])
    return {channelsForUser: userId ? channelsForUser.current[userId] || undefined : undefined, refreshChannelsForUser: incrementRefreshCode}
}

const addChannel = async (channel: ChannelConfig, googleSignInClient: GoogleSignInClient) => {
    const req: AddChannelRequest = {
        channel,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/addChannel', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const deleteChannel = async (channelName: string, googleSignInClient: GoogleSignInClient) => {
    const req: DeleteChannelRequest = {
        channelName,
        auth: {
            userId: googleSignInClient.userId || undefined,
            googleIdToken: googleSignInClient.idToken || undefined
        }
    }
    try {
        await axios.post('/api/deleteChannel', req)
    }
    catch(err) {
        if (err.response) {
            console.log(err.response)
            throw Error(err.response.data)
        }
        else throw err
    }
}

const ChannelListSection: FunctionComponent<Props> = ({onSelectChannel}) => {
    const googleSignInClient = useGoogleSignInClient()
    const {channelsForUser, refreshChannelsForUser} = useChannelsForUser(googleSignInClient?.userId)
    const [status, setStatus] = useState<'ready' | 'processing'>('ready')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const {visible: addingChannelVisible, show: showAddingChannel, hide: hideAddingChannel} = useVisible()

    const handleAddChannel = useCallback((channelName: string) => {
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

    const handleDeleteChannel = useCallback((channelName: string) => {
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

    return (
        <div>
            <h4>Your channels</h4>
            <p>
                These are channels hosted by you; you provide the cloud storage and network communication services.
                You can configure which nodes are allowed to belong to these channels in various roles.
            </p>
            {
                (status === 'ready') && (
                    <span>
                        <IconButton onClick={refreshChannelsForUser} title="Refresh channels"><Refresh /></IconButton>
                        <IconButton onClick={showAddingChannel} title="Add channel"><AddCircle /></IconButton>
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