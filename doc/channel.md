# kachery channels

Within the kachery network, a *channel* is both a community of
nodes which may share information and communicate indirectly with
each other (subject to their granted [permissions](./security.md#Permissions)),
and the infrastructure through which that information sharing and communication
occurs. The kachery network is designed as a *mediated peer-to-peer* information
transfer network: nodes are all potential peers which can both contribute and
receive information, but they communicate with each other indirectly, using the
resources provided by the channel.

## Channel Resources

In order to create a channel, two technical resources are needed:

* A *cloud storage space* such as a Google Cloud Storage Bucket; and
* A *publist-subscribe service API key*.

In addition, each channel needs to have a unique name.

The cloud storage space provides a central location which all nodes on the channel
can make requests to. Outbound requests avoid most firewall issues, and also ensure
that individual nodes do not need to keep track of how to contact a large swarm
of other nodes. To minimize the expense of hosting large files permanently on
the cloud, this storage space is conceived of as a cache--it need not store most
of the information on the channel at any one time, and information on the storage
cache can be cleared out when it has not been used in a while. While a central
storage cache could present a single point of failure, choosing a reputable
cloud storage provider greatly minimizes this risk--it is far more likely that
an individual node (which might be the only one hosting a file) would go down
than that Google would have an extended outage. Moreover, thanks to the central
information transfer channel, nodes can continue to retrieve information that
remains in cache, even if no active node is available to provide that data.

For details on the publish-subscribe communication model, see the documentation on
[node-node communications](./node.md#Communications). Note that the subscription
with the pub-sub provider will need to be provisioned adequately for the traffic
expected on the channel: a small channel with few peer nodes is unlikely to need
more than a basic account, while users using kachery to distribute large numbers
of files with a large conference or the public at large may require somewhat
more requests per minute.

## Channel Permissions

Channels, along with their membership and permissions, are managed via the
[kachery hub](https://www.kacheryhub.org/home) website. You can
[read more about kachery hub here](./hub.md).

## Running a Channel

For the most up-to-date instructions on running a channel, see the
[instructions on kachery hub](https://www.kacheryhub.org/home). No action
is needed aside from on the kachery hub website.
