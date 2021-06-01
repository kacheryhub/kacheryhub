import { Checkbox } from '@material-ui/core'
import React, { FunctionComponent, useMemo } from 'react'
import { NodeConfig } from '../../common/types'

type Props = {
    node: NodeConfig
    channelName: string
    onRefreshNeeded: () => void
}

const EditNodeChannelMembershipRoles: FunctionComponent<Props> = ({node, channelName, onRefreshNeeded}) => {
    // const googleSignInClient = useGoogleSignInClient()
    const roles = [
        [
            {key: 'downloadFiles', label: 'Download files'},
            {key: 'downloadFeeds', label: 'Download feeds'},
            {key: 'downloadTaskResults', label: 'Download task results'}
        ],
        [
            {key: 'requestFiles', label: 'Request files'},
            {key: 'requestFeeds', label: 'Request feeds'},
            {key: 'requestTaskResults', label: 'Request task results'},
        ],
        [
            {key: 'provideFiles', label: 'Provide files'},
            {key: 'provideFeeds', label: 'Provide feeds'},
            {key: 'provideTaskResults', label: 'Provide task results'}
        ]
    ]
    const channelMembership = useMemo(() => {
        return (node.channelMemberships || []).filter(x => (x.channelName === channelName))[0] || undefined
    }, [node, channelName])
    if (!channelMembership) return <span />
    return (
        <div style={{maxWidth: 500}}>
            <table>
                <tbody>
                    {
                        roles.map((r, i) => (
                            <tr key={i}>
                                {
                                    r.map((x, j) => (
                                        <td key={j}>
                                            <RoleComponent key={x.key} label={x.label} value={(channelMembership.roles as {[key: string]: boolean})[x.key]} />
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

type RoleComponentProps = {
    label: string,
    value: boolean
}

const RoleComponent: FunctionComponent<RoleComponentProps> = ({label, value}) => {
    return (
        <span>
            <Checkbox checked={value ? true : false} />
            {label}
        </span>
    )
}

export default EditNodeChannelMembershipRoles