import React, { FunctionComponent, useMemo } from 'react'
import { ChannelConfig } from '../../common/types'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'

type Props = {
    channels: ChannelConfig[]
    onDeleteChannel?: (channelName: string) => void
}

const ChannelsTable: FunctionComponent<Props> = ({channels, onDeleteChannel}) => {
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
                    text: channel.channelName
                }
            }
        }))
    ), [channels])
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            onDeleteRow={onDeleteChannel}
        
        />
    )
}

export default ChannelsTable