import React, { FunctionComponent } from 'react';

type Props = {
    href: string
}

const ExternalLink: FunctionComponent<Props> = ({href, children}) => {
    return (
        <a href={href} target="_blank" rel="noreferrer">{children}</a>
    )
}

export default ExternalLink