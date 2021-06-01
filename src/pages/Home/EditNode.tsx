import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import React, { FunctionComponent, useMemo } from 'react'
import { NodeConfig } from '../../common/types'
import EditNodeChannelMemberships from './EditNodeChannelMemberships'

type Props = {
    node: NodeConfig
    onRefreshNeeded: () => void
}

const EditNode: FunctionComponent<Props> = ({node, onRefreshNeeded}) => {
    const tableRows = useMemo(() => {
        const ret: {key: string, label: string, value: any}[] = []
        ret.push({
            key: 'nodeId',
            label: 'Node',
            value: <span>{node.nodeId}</span>
        })
        ret.push({
            key: 'label',
            label: 'Label',
            value: <span>{node.lastNodeReport ? node.lastNodeReport.nodeLabel : ''}</span>
        })
        ret.push({
            key: 'owner',
            label: 'Owner',
            value: <span>{node.lastNodeReport ? node.lastNodeReport.ownerId : ''}</span>
        })
        ret.push({
            key: 'lastUpdate',
            label: 'Last update',
            value: <span>{node.lastNodeReportTimestamp ? formatTime(new Date(Number(node.lastNodeReportTimestamp))) : ''}</span>
        })
        return ret
    }, [node])
    return (
        <div className="EditNode">
            <Table>
                <TableBody>
                    {
                        tableRows.map(r => (
                            <TableRow key={r.key}>
                                <TableCell key="label">{r.label}</TableCell>
                                <TableCell key="value">{r.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            <EditNodeChannelMemberships node={node} onRefreshNeeded={onRefreshNeeded} />
        </div>
    )
}

function formatTime(d: Date) {
    const datesAreOnSameDay = (first: Date, second: Date) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
    let ret = '';
    if (!datesAreOnSameDay(d, new Date())) {
        ret += `${(d.getMonth() + 1)}/${d.getDate()}/${d.getFullYear()} `;
    }
    ret += `${d.toLocaleTimeString()}`
    return ret;
}

export default EditNode