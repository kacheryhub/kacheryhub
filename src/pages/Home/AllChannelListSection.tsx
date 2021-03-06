import { IconButton } from '@material-ui/core'
import { Refresh } from '@material-ui/icons'
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn'
import { ChannelConfig, GetAllChannelsRequest, isChannelConfig } from 'kacheryInterface/kacheryHubTypes'
import { ChannelName, isArrayOf } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { default as kacheryHubApiRequest } from 'kacheryInterface/kacheryHubApiRequest'
import ChannelsTable from './ChannelsTable'

type Props = {
    onSelectChannel: (channel: ChannelName) => void
}

const useAllChannels = () => {
    const {userId, googleIdToken} = useSignedIn()
    const [allChannels, setAllChannels] = useState<ChannelConfig[] | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => {setRefreshCode(c => (c + 1))}, [])
    useEffect(() => {
        ;(async () => {
            setAllChannels(undefined)
            if (!userId) return
            if (!googleIdToken) return
            const req: GetAllChannelsRequest = {
                type: 'getAllChannels',
                userId,
                auth: {
                    userId,
                    googleIdToken
                }
            }
            const channels = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isArrayOf(isChannelConfig)(channels)) {
                console.warn('Invalid channels', channels)
                return
            }
            setAllChannels(channels)
        })()
    }, [refreshCode, userId, googleIdToken])
    return {allChannels, refreshAllChannels: incrementRefreshCode}
}

const AllChannelListSection: FunctionComponent<Props> = ({onSelectChannel}) => {
    const {allChannels, refreshAllChannels} = useAllChannels()

    return (
        <div>
            <h2>All channels</h2>
            {
                allChannels && (
                    <IconButton onClick={refreshAllChannels} title="Refresh all channels"><Refresh /></IconButton>
                )
            }
            {
                allChannels ? (
                    (allChannels && allChannels.length === 0) ? (
                        <div>No channels found</div>
                    ) : (
                        <ChannelsTable channels={allChannels || []} onClickChannel={onSelectChannel} showOwners={true} />
                    )
                ) : (
                    <div>Loading...</div>
                )
            }
        </div>
    )
}

export default AllChannelListSection