# kachery hub

Peer-to-peer networks experience a tension between several competing goals.
On the one hand, decentralization and ease of growing a network are useful
properties that promote openness and resiliency;
however, they also present challenges to peer
discovery, inter-node communication, and controlling permissions/access.

The current kachery design strikes a balance by choosing a
[mediated peer-to-peer structure](./node.md#communications). In this design,
there is no permanent central repository of data: this removes the administrative
burden and some of the expense of running a central data server, as well as
providing resilience by distributing copies of important data to many different
machines. At the same time, the design's central coordinating hub and
publish-subscribe inter-node communication model alleviate several problems of
a purely distributed system. By providing a central location for nodes to
register with channels, and by ensuring each channel has a central point
of contact, all nodes can communicate using outbound, node-initiated
signals. This alleviates the challenges posed by firewalls in direct
peer-to-peer setups.

The kachery hub serves as a central web site for channel management and node
registration. A user can create a channel and publicize it to potential
members (see [documentation on channels](./channel.md) for requirements), and
anyone running a node can register that node and join one or more channels.
Channel owners also
[use kachery hub to manage the permissions](./security.md#permissions)
granted to nodes that connect to the channel.

## Functions

* **Authentication/Authorization**: users sign in to kachery hub with an account
from a federated authentication provider (e.g. Google). The kachery hub site also
associates the account with owned nodes and channels.

* **Node registration**: a user running a [node](./node.md)
must register it with kachery hub
so that channel owners can give it permissions. Nodes are registered and unique
according to the combination of node ID (automatically generated by the node)
and owner (Google account). This prevents a user from impersonating another
user by registering a node under their name; to do so, the attacker
would have to be able to log in to kachery hub with the
other user's Google account credentials.
TODO: THIS IS VAGUE, WHAT IS THE ATTACK VECTOR WE'RE PROTECTING FROM HERE?

* **Node channel membership**: a node's owner can use kachery hub to register
the node with one or more channels, allowing it to share information with the
other nodes on the channel. As a channel owner, you can limit what actions your
node will engage in on the channel: for instance, if you would prefer that your
node not provide files on the channel, your node will not do so, even if the
channel owner has granted you that permission. Node owners can also control
whether the node will download information from the channel. (WHAT'S THE PURPOSE
OF THIS?)

* **Channel management**: [channels](./channel.md) are communities of nodes
that share information. Any kachery hub user can create a channel by providing
a *unique name*, access credentials to a
*cloud storage resource* that will serve as the channel's cloud storage cache, and
a *publish-subscribe API key* (i.e. [Ably](https://ably.com/pub-sub-messaging))
to authorize nodes to communicate on the channel's pub-sub bands. These credentials
will be stored on the kachery hub system and used to authorize access from
other nodes to the pub-sub communications channels and the cloud storage cache.
These credentials must be stored in a readable format in order to be used in
this fashion; however, they are revocable in the unlikely event of compromise.

## Requirements

To interact with the systems on kachery hub, you will need at least an account
with a federated authentication/authorization provider (i.e. Google), as well as
a computer system under your control where you can host a node. (While it is
possible to interact with kachery hub without this, there is little meaningful
action available if you don't have a node.) It is not technically required to
have a node in order to register a channel, but for most use cases, the channel
owner would want to have a node with which to begin providing data--it would be
rather unusual for a channel to be managed by someone who does not participate.