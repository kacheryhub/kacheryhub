import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { isArrayOf } from '../../common/kacheryTypes/kacheryTypes'
import { AddChannelRequest, ChannelConfig, DeleteChannelRequest, GetChannelsForUserRequest, isChannelConfig } from '../../common/types'
import AddChannelControl from './AddChannelControl'
import ChannelsTable from './ChannelsTable'

type Props = {
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

const ChannelListSection: FunctionComponent<Props> = () => {
    const googleSignInClient = useGoogleSignInClient()
    const {channelsForUser, refreshChannelsForUser} = useChannelsForUser(googleSignInClient?.userId)
    const [status, setStatus] = useState<'ready' | 'processing'>('ready')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handleAddChannel = useCallback((channelName: string) => {
        if (!googleSignInClient) return
        const userId = googleSignInClient.userId
        if (!userId) return
        if (status !== 'ready') return
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
    }, [refreshChannelsForUser, googleSignInClient, status])

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
            {
                (channelsForUser && channelsForUser.length === 0) && (
                    <div>You do not have any channels</div>
                )
            }
            {
                <ChannelsTable channels={channelsForUser || []} onDeleteChannel={(status === 'ready') ? handleDeleteChannel : undefined} />
            }
            {
                (status === 'ready') && (channelsForUser) ? (
                    <AddChannelControl onAddChannel={handleAddChannel} />
                ) : (
                    <span>{status === 'processing' && (<span>Processing...</span>)}</span>
                )
            }
            {
                errorMessage && (
                    <span style={{color: 'red'}}>{errorMessage}</span>
                )
            }
        </div>
    )
}

export default ChannelListSection