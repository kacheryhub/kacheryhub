import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { ChannelConfig } from 'kachery-js/types/kacheryHubTypes'
import { ChannelName, isChannelName } from 'kachery-js/types/kacheryTypes'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import NiceTable from '../../commonComponents/NiceTable/NiceTable'

type Props = {
    channels: ChannelConfig[]
    onClickChannel?: (channelName: ChannelName) => void
    onDeleteChannel?: (channelName: ChannelName) => void
    showOwners?: boolean
}

const ChannelsTable: FunctionComponent<Props> = ({channels, onClickChannel, onDeleteChannel, showOwners}) => {
    const columns = useMemo(() => {
        const r = [
            {
                key: 'channelName',
                label: 'Channel'
            }
        ]
        if (showOwners) {
            r.push({
                key: 'ownerId',
                label: 'Owner'
            })
        }
        return r
    }, [showOwners])
    const rows = useMemo(() => (
        channels.map(channel => ({
            key: channel.channelName.toString(),
            columnValues: {
                channelName: {
                    text: channel.channelName.toString(),
                    element: <Hyperlink onClick={() => {onClickChannel && onClickChannel(channel.channelName)}}>{channel.channelName}</Hyperlink>
                },
                ownerId: {
                    text: channel.ownerId.toString()
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