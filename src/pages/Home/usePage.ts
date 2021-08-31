import { channelName, ChannelName, isNodeId, NodeId } from 'kachery-js/types/kacheryTypes'
import QueryString from 'querystring'
import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

export type Page = {
    page: 'home'
} | {
    page: 'node'
    nodeId: NodeId
} | {
    page: 'channel'
    channelName: ChannelName
} | {
    page: 'registerNode'
} | {
    page: 'joinChannel',
    nodeId?: NodeId
} | {
    page: 'nodeChannelMembership',
    nodeId: NodeId
    channelName: ChannelName
}

const usePage = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);
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
        else if (p[1] === 'registerNode') {
            return {
                page: 'registerNode'
            }
        }
        else if (p[1] === 'joinChannel') {
            return {
                page: 'joinChannel',
                nodeId: query['node'] ? query['node'] as any as NodeId : undefined
            }
        }
        else if (p[1] === 'nodeChannelMembership') {
            const ni = p[2]
            const cn = channelName(p[3])
            if (isNodeId(ni)) {
                return {
                    page: 'nodeChannelMembership',
                    nodeId: ni,
                    channelName: cn
                }
            }
        }
        return {
            page: 'home'
        }
    }, [location, query])
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
        else if (page.page === 'registerNode') {
            history.push({
                ...location,
                pathname: `/registerNode`
            })
        }
        else if (page.page === 'joinChannel') {
            history.push({
                ...location,
                pathname: `/joinChannel`,
                search: page.nodeId ? queryString({node: page.nodeId.toString()}) : ''
            })
        }
        else if (page.page === 'nodeChannelMembership') {
            history.push({
                ...location,
                pathname: `/nodeChannelMembership/${page.nodeId}/${page.channelName}`
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

const queryString = (params: { [key: string]: string | string[] }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            const v = params[key]
            if (typeof(v) === 'string') {
                return encodeURIComponent(key) + '=' + v
            }
            else {
                return v.map(a => (encodeURIComponent(key) + '=' + a)).join('&')
            }
        }).join('&')
    )
}

export default usePage