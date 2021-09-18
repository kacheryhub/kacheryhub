import { Button, Table, TableBody, TableCell, TableRow, TextField } from '@material-ui/core';
import { isResourceInfo, ResourceInfo } from 'bitwooderInterface/BitwooderResourceRequest';
import { useSignedIn } from 'commonComponents/googleSignIn/GoogleSignIn';
import { ChannelName, isNodeId, NodeId } from 'commonInterface/kacheryTypes';
import kacheryHubApiRequest from 'kacheryInterface/kacheryHubApiRequest';
import { AddChannelRequest, GetBitwooderResourceInfoRequest } from 'kacheryInterface/kacheryHubTypes';
import useNodesForUser from 'pages/Home/useNodesForUser';
import usePage from 'pages/Home/usePage';
import ExternalLink from 'pages/wizards/FigurlWizard/ExternalLink';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

type Props = {

}

const CreateChannelPage: FunctionComponent<Props> = () => {
    const [resourceKey, setResourceKey] = useState<string>('')
    const [resourceInfo, setResourceInfo] = useState<ResourceInfo | undefined>(undefined)
    const [resourceInfoStatus, setResourceInfoStatus] = useState<string>('waiting')
    const [newChannelName, setNewChannelName] = useState<string>('')
    const [nodeIdsText, setNodeIdsText] = useState<string>('')
    const [submitErrorText, setSubmitErrorText] = useState<string>('')

    const {userId, googleIdToken} = useSignedIn()

    const handleResourceKeyChange = useCallback((event: any) => {
        setResourceKey(event.target.value)
    }, [])

    const handleNewChannelNameChange = useCallback((event: any) => {
        setNewChannelName(event.target.value)
    }, [])

    const handleNodeIdsTextChange = useCallback((event: any) => {
        setNodeIdsText(event.target.value)
    }, [])

    useEffect(() => {
        setResourceInfo(undefined)
        setResourceInfoStatus('waiting')
        if (!userId) return
        if (resourceKey.length !== 64) return
        setResourceInfoStatus('running')
        ;(async () => {
            const req: GetBitwooderResourceInfoRequest = {
                type: 'getBitwooderResourceInfo',
                resourceKey,
                auth: {
                    userId,
                    googleIdToken
                }
            }
            try {
                const resp = await kacheryHubApiRequest(req, {reCaptcha: true})
                if (!isResourceInfo(resp)) {
                    throw Error('Invalid response to getBitwooderResourceInfo')
                }
                setResourceInfo(resp)
                setResourceInfoStatus('finished')
            }
            catch(err: any) {
                console.warn('Error getting resource info', err)
                setResourceInfoStatus('error')
                return
            }
            
        })()
    }, [resourceKey, userId, googleIdToken])

    const nodeIds = useMemo(() => {
        const ret: NodeId[] = []
        const x = nodeIdsText.split('\n')
        for (let n of x) {
            if (n) {
                if (!isNodeId(n)) return undefined
                ret.push(n)
            }
        }
        return ret
    }, [nodeIdsText])

    const {setPage} = usePage()

    const handleSubmit = useCallback(() => {
        setSubmitErrorText('')
        if (!userId) return
        if (!newChannelName) return
        if (!resourceInfo) return
        if (!nodeIds) return
        ;(async () => {
            const req: AddChannelRequest = {
                type: 'addChannel',
                channel: {
                    channelName: newChannelName as any as ChannelName,
                    ownerId: userId,
                    bitwooderResourceId: resourceInfo.resourceId,
                    bitwooderResourceKey: resourceKey,
                    bucketBaseUrl: resourceInfo.bucketBaseUrl,
                    authorizedNodes: nodeIds.map(nodeId => ({
                        channelName: newChannelName as any as ChannelName,
                        nodeId,
                        permissions: {
                            requestFiles: true,
                            requestFeeds: true,
                            requestTasks: true,
                            provideFiles: true,
                            provideFeeds: true,
                            provideTasks: true
                        }
                    }))
                },
                auth: {
                    userId,
                    googleIdToken
                }
            }
            try {
                await kacheryHubApiRequest(req, {reCaptcha: true})
            }
            catch(err: any) {
                setSubmitErrorText(err.message)
                return
            }
            setPage({page: 'home'})
        })()
    }, [userId, googleIdToken, newChannelName, resourceKey, resourceInfo, nodeIds, setPage])

    const {nodesForUser} = useNodesForUser(userId)

    const okayToSubmit = useMemo(() => {
        return (nodeIds !== undefined)
    }, [nodeIds])

    return (
        <div>
            <h2>Create a kachery channel</h2>
            <p>
                Before you create a channel, you will need to obtain cloud resources from <ExternalLink href="https://bitwooder.net">bitwooder.net</ExternalLink>.
                Bitwooder allows you to register your own resources (e.g., storage buckets),
                but also provides some limited resources for free, to help you get started.
            </p>
            <p>
                Once you have created or claimed your Bitwooder resource, copy the secret resource key
                and paste it here:
            </p>
            <TextField
                style={{width: '100%'}}
                label={`Bitwooder resource key`}
                value={resourceKey}
                onChange={handleResourceKeyChange}
            />
            {
                resourceInfoStatus === 'running' && <div>Looking up info...</div>
            }
            {
                resourceInfo && (
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Resource ID</TableCell>
                                <TableCell>{resourceInfo.resourceId}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Bucket URL</TableCell>
                                <TableCell>{resourceInfo.bucketBaseUrl}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )
            }
            {
                resourceInfo && (
                    <div>
                        <p>Your resource has been found. Please keep the resource key secret.</p>
                        <p>Enter a name for your new channel:</p>
                        <TextField
                            label={`Kachery channel name`}
                            value={newChannelName}
                            onChange={handleNewChannelNameChange}
                        />
                    </div>
                )
            }
            {
                resourceInfo && newChannelName && (
                    <div>
                        <p>The final step is to specify which nodes you want to have access to this new channel.</p>
                        <p>
                            The node ID for figurl is:
                        </p>
                        <pre>0c5cfa3e678d35d7d96422eb0450ff697058761d416aa1a6dde57a1701cfdaa9</pre>
                        <p>The IDs for your kachery nodes are:</p>
                        <pre>
                            {
                                (nodesForUser || []).map(n => (
                                    n.nodeId
                                )).join('\n')
                            }
                        </pre>
                        <p>
                            Enter the IDs for the nodes you want to have access to this channel (one on each line):
                        </p>
                        <TextField
                            style={{width: '100%'}}
                            label={`Node IDs`}
                            multiline
                            value={nodeIdsText}
                            onChange={handleNodeIdsTextChange}
                        />
                    </div>
                )
            }
            {
                resourceInfo && newChannelName && (
                    <div><Button onClick={handleSubmit} disabled={!okayToSubmit}>Add channel</Button></div>
                )
            }
            <div style={{color: 'red'}}>
                {submitErrorText}
            </div>
        </div>
    )
}

export default CreateChannelPage