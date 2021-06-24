# Security Model for kachery

The kachery network is designed to ensure that access is provided
only to trusted parties. While it is not currently suitable for
high-security data (such as data requiring HIPAA compliance or
financial data), the system intends that information
is only provided by, and accessible to, appropriately trusted parties,
while still allowing for anonymous public access when appropriate.

## Permissions

Permissions are assigned through kachery hub, on a per-channel
basis. The owner of each named kachery channel assigns permissions to
individual [nodes](./node.md). The possible permissions are:

* Request File
* Provide File
* Request Feed
* Provide Feed
* Request Task
* Provide Task

A node which lacks "request" permissions for a given information
type *cannot* solicit other nodes to provide missing data; it is
restricted to only the data that is already present in the
cloud storage cache. (Note that this information may change from
time to time due to files being evicted from cache.)

A node without "provide" permissions for a given information type
*cannot* upload data into the cloud storage cache, and cannot even
see requests coming from other nodes.

Each permission on a named kachery channel implies a certain set of
access permissions to the pub-sub communication channels. See
[the documentation on node-node communications](./node.md#coordinating_communications)
for details.

Permissions cannot be forced on a node unilaterally. The person owning
or running a node must specify what permissions the node requests on
each channel to which it is joined. Ultimately, the actual permissions
will be the intersection of the permission lists: nodes have only
those permissions which have been both requested by the node owner
and granted by the channel owner.

Note that permissions are granted to a combination of the *node*
(identified by a node key) and its *owner* (identified by the federated
authentication acccount provider, e.g. a Google account). Thus, even in a
situation where multiple users share logins to the same machine and run
a node with the same key, permissions are specific to the user named by
the `--owner` parameter with which the kachery daemon was invoked.
**TODO: How do I prevent someone from impersonating my node if they have
a login on my box?**

## Uploads

The cloud storage cache is a (paid) resource which should be owned by the
channel owner. However, to allow semi-decentralized data sharing among peers,
the kachery network must permit other nodes--which are likely owned by
other parties--to write to cloud storage. This is accomplished by means of
*[signed upload URLs](https://cloud.google.com/storage/docs/access-control/signed-urls)*
which act something like a prepaid mailing label for files. When a node wishes to
upload a file to the cloud storage cache, it requests a pre-signed URL
from kachery hub. This is a URL for a specified file name and size which
allows upload to a specific cloud storage location. An entity that knows this
URL can make an HTTP PUT request to it in order to upload a file to the cloud.

## Channel owner stored credentials

kachery hub manages access to the various resources owned by the channel
owner: specifically, the cloud storage cache and the Ably pub-sub channels.
In order to provide nodes with access, kachery hub needs to store
these credentials and provide limited-access tokens upon
appropriately validated request.

In order to create upload URLs, kachery hub needs to use the
*channel owner's cloud storage provider access credentials*. These should
have been registered at the time the channel was created.

kachery hub also requires the Ably API key to provide pub-sub channel
access tokens to nodes. To interact with other nodes, a node requests
the appropriate subscribe and publish permissions from kachery hub.
The kachery hub server acts as an authentication/authorization server;
it verifies the identify of the node-owner pair (using signature verification)
and, if the node checks out, it uses the Ably API key of the channel owner
to provide the node with temporary access tokens to the pub-sub channels.
(These expire after around 30 minutes and must be renewed at that time.)

## Feeds

Because kachery file storage is content-addressable, files are essentially
self-verifying: the file name is the cryptographic hash, which can
be readily checked by anyone who obtains the file.

Feeds, however, will grow over their lifetimes, and so require a different
mechanism for verification. This is accomplished by public-key cryptography.
Each feed ID is a public key, whose private counterpart is kept by the node
which owns the feed. Each message appended to the feed must be signed
by the feed owner's private key. This signature is checked by any
requesting node when the feed's data is downloaded.
[NOTE, however, that there is no defined response at present in
the event of a signature mismatch.]

Having a unique owner node also makes feeds different from other
types of information shared over the kachery network. Any node that
has a file can legitimately upload it, regardless of who
created it; but only the owner node can provide a
canonical version of a feed. While the owning node may accept
new messages into a subfeed that come from other nodes, those
new feed entries have to be approved by being signed by the
owning node.

## Caveats

* Permissions are assigned on a per-node basis, not a per-file basis.
The assumption is that all files (/feeds/tasks) shared on a channel
are of the same sensitivity and should have the same access rights.

* In particular, there is no distinction in the
permission system between a node being allowed to upload files that were
originally provided by other nodes (and perhaps have fallen out of the
cloud cache), and that node being allowed to provide new files for which
it is the original source.

* As described in the documentation for running nodes, it is possible
to configure a node so that remote clients can connect to it. (This allows,
for instance, a lab's members to use a single central node to talk with the
wider network, accessing the shared node through clients on their individual
workstations.) This greatly simplifies the administrative burden for both
channel owners and individual labs, but it does mean that any individual
who can connect to a node will have the full set of permissions granted to that node.
Ultimately, any system must contend with this in some fashion--any person
with access to privileged files could potentially choose to share them with
others--but to avoid accidents, it is important that the owners of trusted nodes
are informed and responsible parties who can be expected to allow access to
their nodes appropriately.

* Files are not flagged with the channel they came from. So, if channel A
is configured to share its cloud storage cache with channel B,
then a node with access to channel A could conceivably retrieve files associated
with channel B in certain limited circumstances. To avoid this issue, channel
owners are discouraged from sharing one cloud storage space between multiple channels.

* The pre-signed URL for file upload includes the name and size of the file to
be uploaded. [DOUBLE-CHECK THAT] Since kachery is a content-addressable
storage system, the name of the file should correspond to the hash of its contents.
Files can be verified by confirming that the file hashes out to the value indicated
by its name.
However, because the cloud storage cache has no attached processing, there is no
mechanism for verifying this property at upload time in the cache itself: the cloud
storage cache cannot provide any guarantees about file contents.
Files downloaded from the cloud storage cache
must be treated as unverified, and re-checked by the downloading node before use.
A malicious actor could potentially upload invalid or mislabeled data
to the cloud cache; this would not be caught until the data was downloaded
by other nodes. To mitigate this possibility, again, ensure that permissions
are only granted to trustworthy nodes with responsible owners.
