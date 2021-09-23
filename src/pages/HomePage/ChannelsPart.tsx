import { IconButton } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { ChannelName } from 'commonInterface/kacheryTypes';
import kacheryHubApiRequest from 'kacheryInterface/kacheryHubApiRequest';
import { DeleteChannelRequest } from 'kacheryInterface/kacheryHubTypes';
import BoxButton from 'pages/Home/BoxButton';
import ChannelsTable from 'pages/Home/ChannelsTable';
import useChannelsForUser from 'pages/Home/useChannelsForUser';
import usePage from 'pages/Home/usePage';
import React, { FunctionComponent, useCallback } from 'react';

type Props = {

}

const ChannelsPart: FunctionComponent<Props> = () => {
    const {userId, googleIdToken} = useSignedIn()
    const {channelsForUser, refreshChannelsForUser} = useChannelsForUser(userId)
    const {setPage} = usePage()
    const handleCreateChannel = useCallback(() => {
        setPage({page: 'createChannel'})
    }, [setPage])

    const handleDeleteChannel = useCallback((channelName: ChannelName) => {
        if (!userId) return
        ;(async () => {
            const req: DeleteChannelRequest = {
                type: 'deleteChannel',
                channelName,
                auth: {
                    userId,
                    googleIdToken
                }
            }
            await kacheryHubApiRequest(req, {reCaptcha: false})
            refreshChannelsForUser()
        })()
    }, [userId, googleIdToken, refreshChannelsForUser])

    const handleClickChannel = useCallback((channelName: ChannelName) => {
        setPage({page: 'channel', channelName})
    }, [setPage])

    if (!channelsForUser) return (
        <div>
            <h2>Your channels</h2>
            <p>Loading channels...</p>
        </div>
    )
    return (
        <div>
            <h2>Your channels</h2>
            <p>
                These are channels owned by you. Each is associated with a Bitwooder cloud resource.
            </p>
            {
                channelsForUser.length === 0 ? (
                    <div>
                        <p>You do not own any channels</p>
                        <IconButton onClick={refreshChannelsForUser} title="Refresh channels"><Refresh /></IconButton>
                    </div>
                ) : (
                    <div>
                        <p>You own the following channels:</p>
                        <IconButton onClick={refreshChannelsForUser} title="Refresh channels"><Refresh /></IconButton>
                        <ChannelsTable
                            channels={channelsForUser}
                            onClickChannel={handleClickChannel}
                            onDeleteChannel={handleDeleteChannel}
                        />
                    </div>
                )
            }
            {
                <BoxButton
                    label="Create a new channel"
                    onClick={handleCreateChannel}
                />
            }
        </div>
    )
}

export default ChannelsPart