import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { ChannelConfig } from 'kachery-js/types/kacheryHubTypes'
import { ChannelName, isChannelName } from 'kachery-js/types/kacheryTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'

type Props = {
    channels: ChannelConfig[]
    onClickChannel?: (channelName: ChannelName) => void
    onDeleteChannel?: (channelName: ChannelName) => void
}

const ChannelsTable: FunctionComponent<Props> = ({channels, onClickChannel, onDeleteChannel}) => {
    const columns = useMemo(() => ([
        {
            key: 'channelName',
            label: 'Channel'
        }
    ]), [])
    const rows = useMemo(() => (
        channels.map(channel => ({
            key: channel.channelName.toString(),
            columnValues: {
                channelName: {
                    text: channel.channelName.toString(),
                    element: <Hyperlink onClick={() => {onClickChannel && onClickChannel(channel.channelName)}}>{channel.channelName}</Hyperlink>
                }
            }
        }))
    ), [channels, onClickChannel])
    const handleDeleteChannel = useCallback((key: string) => {
        if (!isChannelName(key)) throw Error('Unexpected')
        onDeleteChannel && onDeleteChannel(key)
    }, [onDeleteChannel])
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            onDeleteRow={onDeleteChannel && handleDeleteChannel}
        
        />
    )
}

export default ChannelsTable