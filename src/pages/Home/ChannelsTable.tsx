import React, { FunctionComponent, useMemo } from 'react'
import { ChannelConfig } from '../../common/types/kacheryHubTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'

type Props = {
    channels: ChannelConfig[]
    onClickChannel?: (channelName: string) => void
    onDeleteChannel?: (channelName: string) => void
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
            key: channel.channelName,
            columnValues: {
                channelName: {
                    text: channel.channelName,
                    element: <Hyperlink onClick={() => {onClickChannel && onClickChannel(channel.channelName)}}>{channel.channelName}</Hyperlink>
                }
            }
        }))
    ), [channels, onClickChannel])
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            onDeleteRow={onDeleteChannel}
        
        />
    )
}

export default ChannelsTable