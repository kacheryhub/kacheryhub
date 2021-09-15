import { useSignedIn } from 'commonInterface/googleSignIn/GoogleSignIn';
import kacheryHubApiRequest from 'kacheryInterface/kacheryHubApiRequest';
import { GetChannelStatsRequest, isGetChannelStatsResponse } from 'kacheryInterface/kacheryHubTypes';
import { ChannelName } from 'commonInterface/kacheryTypes';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

type Props = {
    channelName: ChannelName
}

const useChannelStats = (channelName: ChannelName) => {
    const [channelStats, setChannelStats] = useState<any | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const incrementRefreshCode = useCallback(() => setRefreshCode(c => (c + 1)), [])
    const {userId, googleIdToken} = useSignedIn()
    useEffect(() => {
        setChannelStats(undefined)
        if (!userId) return
        ;(async () => {
            const req: GetChannelStatsRequest = {
                type: 'getChannelStats',
                channelName,
                auth: {
                    userId,
                    googleIdToken
                }
            }
            const response = await kacheryHubApiRequest(req, {reCaptcha: false})
            if (!isGetChannelStatsResponse(response)) {
                throw Error('Problem with getChannelStats response')
            }
            setChannelStats(response.channelStats)
        })()
    }, [refreshCode, channelName, userId, googleIdToken])
    
    return {channelStats, refreshChannelStats: incrementRefreshCode}
}

const ChannelStatsView: FunctionComponent<Props> = ({channelName}) => {
    const {channelStats} = useChannelStats(channelName)
    return (
        <div><pre>{JSON.stringify(channelStats, null, 4)}</pre></div>
    )
}

export default ChannelStatsView