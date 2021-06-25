# kachery network

The kachery network is organized into nodes and channels, and each node may belong to one or more channels.

* A **[node](./node.md)** is usually a running instance of the [kachery daemon](https://github.com/kacheryhub/kachery-daemon) software: think of it as a computer
whose user would like to send or receive files. Communication and data transfer on the network takes
place between nodes via channels.

* A **[channel](./channel.md)** defines a community of nodes that exchange files: the channel has
a unique identifier and a particular owner who can control access to it. It also
defines associated cloud storage and pub-sub communication resources which facilitate data transfer and interaction between nodes.

* **[kacheryhub](./hub.md)** is the central website where a user
can create or manage channels, configure nodes, and where a channel owner
can control which nodes have permission to connect to the channel
and what actions they are allowed to take in the channel. This site also acts as a *federated authentication provider* for granting access to nodes for cloud resources associated with channels.

* **[Storage buckets](./storage-bucket.md)** are cloud resources associated with channels and are used as both a cache and as a [bus](https://en.wikipedia.org/wiki/Bus_(computing))
over which data is transferred between nodes (nodes do not interact directly with each other). For now kachery exclusively uses
[Google Cloud Storage Buckets](https://cloud.google.com/storage/docs/creating-buckets)), but in the future it will be possible to use AWS S3 buckets or other custom object storage solutions.

* **[Publish/subscribe channels](./pub-sub.md)** are used for low-latency communication between nodes. Much the same as nodes use a cloud storage
bucket to transfer files, they also communicate requests and status messages
through shared publish/subscribe (pub-sub) message channels. This is presently implemented
through the [Ably](https://ably.com/pub-sub-messaging) service. A node requesting
a file will send a message to the corresponding pub-sub channel,
and nodes with file-uploading permissions listen for requests and respond by uploading
the file to the cloud storage space.

See also:

* [Kachery security model](./security.md)

