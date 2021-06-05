import { brown } from '@material-ui/core/colors'
import React, { FunctionComponent } from 'react'
import version from '../../common/version'
import ApplicationBar from './ApplicationBar'
import Content from './Content'
import './Home.css'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    return (
        <div>
            <ApplicationBar />
            <div style={{width: '100%', height: 64}} />
            <div style={{maxWidth: 1400, margin: 'auto', paddingLeft: 20, paddingRight: 20}}>
                <Content />
            </div>
            <div style={{width: '100%', height: 20, borderBottom: `solid 2px ${brown[600]}`}} />
            <div style={{maxWidth: 1400, margin: 'auto', paddingLeft: 20, paddingRight: 20}}>
                <p style={{fontFamily: 'courier', color: 'rgb(52, 42, 10)'}}>Kacheryhub version: {version}</p>
            </div>
        </div>
        
    )
}

export default Home