import Hyperlink from 'commonComponents/Hyperlink/Hyperlink'
import 'github-markdown-css'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from "react-markdown"
import Markdown from './Markdown'

export interface MarkdownProps {
    data: {files: {[key: string]: {content: string}}}
    page: string
    substitute?: { [key: string]: string | undefined | null }
    linkTarget?: '_blank' | ReactMarkdown.LinkTargetResolver // (uri: string, text: string, title?: string) => string
    renderers?: ReactMarkdown.Renderers
}

const MultipageMarkdown: FunctionComponent<MarkdownProps> = ({ data, page, substitute, linkTarget, renderers }) => {
    const [internalPage, setInternalPage] = useState<string | undefined>(undefined)
    const source = useMemo(() => {
        const f = data.files[internalPage || '']
        if (!f) return 'Not found'
        return f.content
    }, [internalPage, data])
    useEffect(() => {
        setInternalPage(page)
    }, [page])
    const renderers2 = useMemo(() => {
        const ret: ReactMarkdown.Renderers = {...(renderers || {})}
        const aRenderer: ReactMarkdown.Renderer<{href: string, children:any}> = (props) => {
            const {href, children} = props
            if (href.startsWith('./')) {
                return <Hyperlink onClick={() => setInternalPage(href.slice(2))}>{children}</Hyperlink>
            }
            else {
                return <a {...props}>{children}</a>
            }
        }
        ret['a'] = aRenderer
        return ret
    }, [renderers])
    return (
        <Markdown
            source={source}
            substitute={substitute}
            linkTarget={linkTarget}
            renderers={renderers2}
        />
    )
}

export default MultipageMarkdown