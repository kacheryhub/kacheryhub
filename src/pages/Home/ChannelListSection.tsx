import axios from 'axios'
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react'
import GoogleSignInClient from '../../common/googleSignIn/GoogleSignInClient'
import useGoogleSignInClient from '../../common/googleSignIn/useGoogleSignInClient'
import { isArrayOf } from '../../common/kacheryTypes/kacheryTypes'
import { AddChannelRequest, ChannelConfig, GetChannelsForUserRequest, isChannelConfig, Auth } from '../../common/types'

type Props = {
}

const useChannelsForUser = (userId?: string | null) => {
    const channelsForUser = useRef<{[key: string]: ChannelConfig[]}>({})
    const googleSignInClient = useGoogleSignInClient()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    const [updateCode, setUpdateCode] = useState<number>(0)
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
    await axios.post('/api/addChannel', req)
}

const ChannelListSection: FunctionComponent<Props> = () => {
    const googleSignInClient = useGoogleSignInClient()
    const {channelsForUser, refreshChannelsForUser} = useChannelsForUser(googleSignInClient?.userId)

    const handleAddChannel = useCallback(() => {
        if (!googleSignInClient) return
        const userId = googleSignInClient.userId
        if (!userId) return
        const newChannel: ChannelConfig = {
            channelName: 'test-channel',
            ownerId: userId
        }
        addChannel(newChannel, googleSignInClient).then(() => {
            refreshChannelsForUser()
        })
        
    }, [refreshChannelsForUser, googleSignInClient])

    console.log('---', channelsForUser)
    return (
        <div>
        <h4>Your channels</h4>
            {
                (channelsForUser && channelsForUser.length === 0) && (
                    <div>You do not have any channels</div>
                )
            }
            {
                (channelsForUser || []).map((c: ChannelConfig) => (
                    <div>{c.channelName}</div>
                ))
            }
            <button onClick={handleAddChannel}>Add channel</button>
        </div>
    )
}

export default ChannelListSection