import { Checkbox } from "@material-ui/core"
import { FunctionComponent, useCallback } from "react"
import { NodeChannelMembership } from "kacheryInterface/kacheryHubTypes"

type RoleComponentProps = {
    roleKey: string,
    label: string,
    requiresAuth: boolean
    nodeChannelMembership?: NodeChannelMembership
    onChange?: (roleKey: string, v: boolean) => void
}

const RoleComponent: FunctionComponent<RoleComponentProps> = ({roleKey, label, requiresAuth, nodeChannelMembership, onChange}) => {
    const authorized = (!requiresAuth) || (
        (nodeChannelMembership) && (nodeChannelMembership.authorization) && ((nodeChannelMembership.authorization.permissions as {[key: string]: boolean})[roleKey])
    )
    const checked = nodeChannelMembership && (nodeChannelMembership.roles as {[key: string]: boolean})[roleKey]
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.checked
        onChange && onChange(roleKey, v)
    }, [roleKey, onChange])
    return (
        <span>
            <Checkbox checked={checked ? true : false} disabled={(!onChange) || (!authorized)} onChange={handleChange} />
            <span style={{color: authorized ? 'black' : 'gray'}}>{label}</span>
        </span>
    )
}

export default RoleComponent