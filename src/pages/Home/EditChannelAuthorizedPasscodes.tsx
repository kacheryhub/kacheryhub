import { IconButton } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import { ChannelConfig, isPasscode, Passcode, PasscodeChannelAuthorization } from 'kacheryInterface/kacheryHubTypes'
import { ChannelName } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import NiceTable from 'commonInterface/commonComponents/NiceTable/NiceTable'
import useVisible from 'commonInterface/commonComponents/useVisible'
import AddAuthorizedPasscodeControl from './AddAuthorizedPasscodeControl'
import EditPasscodeChannelAuthorization from './EditPasscodeChannelAuthorization'
import HidePasscode from './HidePasscode'

type Props = {
    channel: ChannelConfig
    onAddAuthorizedPasscode?: (channelName: ChannelName, passcode: string) => void
    onUpdateAuthorization?: (a: PasscodeChannelAuthorization) => void
    onDeleteAuthorization?: (channelName: ChannelName, passcode: Passcode) => void
}

const EditChannelAuthorizedPasscodes: FunctionComponent<Props> = ({channel, onUpdateAuthorization, onAddAuthorizedPasscode, onDeleteAuthorization}) => {
    const columns = useMemo(() => ([
        {
            key: 'passcode',
            label: 'Passcode'
        },
        {
            key: 'authorization',
            label: 'Authorization'
        },
        {
            key: 'roles',
            label: 'Roles'
        }
    ]), [])
    const rows = useMemo(() => (
        (channel.authorizedPasscodes || []).map(x => {
            return {
                key: x.passcode.toString(),
                columnValues: {
                    passcode: {
                        text: x.passcode,
                        element: <HidePasscode passcode={x.passcode} copyable={true} />
                    },
                    authorization: {
                        element: <EditPasscodeChannelAuthorization authorization={x} onUpdateAuthorization={onUpdateAuthorization} />
                    }
                }
            }
        })
    ), [channel, onUpdateAuthorization])
    const {visible: addAuthorizedPasscodeVisible, show: showAddAuthorizedPasscode, hide: hideAddAuthorizedPasscode} = useVisible()

    const handleDeleteAuthorization = useCallback((passcode: string) => {
        if (!isPasscode(passcode)) {
            console.warn('Invalid passcode', passcode)
            return
        }
        onDeleteAuthorization && onDeleteAuthorization(channel.channelName, passcode)
    }, [channel.channelName, onDeleteAuthorization])

    return (
        <div>
            <h2>Authorized passcodes</h2>
            <p>Configure access passcodes for this channel.</p>
            {
                onAddAuthorizedPasscode && (
                    <span>
                        <IconButton onClick={showAddAuthorizedPasscode} title="Add authorized passcode"><Add /></IconButton>
                        {
                            addAuthorizedPasscodeVisible && (
                                <span>
                                    <AddAuthorizedPasscodeControl
                                        channelName={channel.channelName}
                                        onAddAuthorizedPasscode={(channelName, passcode) => {hideAddAuthorizedPasscode(); onAddAuthorizedPasscode(channelName, passcode);}}
                                        onCancel={hideAddAuthorizedPasscode}
                                    />
                                </span>
                            )
                        }
                    </span>
                )
            }
            <span className="AlternateRowColors">
                <NiceTable
                    columns={columns}
                    rows={rows}
                    onDeleteRow={onDeleteAuthorization ? handleDeleteAuthorization : undefined}
                />
            </span>
        </div>
    )
}

export default EditChannelAuthorizedPasscodes