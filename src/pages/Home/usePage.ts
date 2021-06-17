import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { channelName, ChannelName, isNodeId, NodeId } from 'kachery-js/types/kacheryTypes'

export type Page = {
    page: 'home'
} | {
    page: 'node'
    nodeId: NodeId
} | {
    page: 'channel'
    channelName: ChannelName
}

const usePage = () => {
    const location = useLocation()
    const history = useHistory()
    const page: Page = useMemo(() => {
        const p = location.pathname.split('/')
        if (p[1] === 'node') {
            const nodeId = p[2]
            if (isNodeId(nodeId)) {
                return {
                    page: 'node',
                    nodeId
                }
            }
        }    
        else if (p[1] === 'channel') {
            const cn = channelName(p[2])
            return {
                page: 'channel',
                channelName: cn
            }
        }
        return {
            page: 'home'
        }
    }, [location])
    const setPage = useCallback((page: Page) => {
        if (page.page === 'node') {
            history.push({
                ...location,
                pathname: `/node/${page.nodeId}`
            })
        }
        else if (page.page === 'channel') {
            history.push({
                ...location,
                pathname: `/channel/${page.channelName}`
            })
        }
        else {
            history.push({
                ...location,
                pathname: '/home'
            })
        }
    }, [history, location])
    
    
    return useMemo(() => ({page, setPage}), [page, setPage])
}

export default usePage