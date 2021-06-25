# kachery

Kachery is a software suite which facilitates sharing data for scientific or technical research.

## What it does

The kachery software suite facilitates sharing three types of data:

* **Files** are data files, of any size. Files over 20 MiB will be broken into
smaller pieces for transfer and caching.

* **Feeds** are *append-only* logs, which operate like a digital
[lab notebook](https://en.wikipedia.org/wiki/Lab_notebook) or
[ledger](https://en.wikipedia.org/wiki/Ledger). Because such a feed is append-only
and signed, it presents a reliable history of actions taken by any agent; and
because it is complete, it offers a single source of truth from which the current
state of any system built on kachery can be reconstructed just by replaying the
log. For more details, consult the [feeds documentation](./feeds.md).

* **Tasks** are operations acting on files or feeds in the system. The system
supports three basic types of tasks:
  * *Pure calculation tasks* are pure functions in the
  [computational](https://en.wikipedia.org/wiki/Pure_function)
  or [mathematical](https://en.wikipedia.org/wiki/Function_(mathematics)) sense.
  kachery provides a deterministic unique identifier for the combination
  of a pure function and the arguments it was called with, and maps that identifier to
  the result of the computation which is cached.
  This eliminates the need for duplicate calculations,
  which is particularly useful for computationally intensive processes.
  * *Queries* are tasks whose result depends on some external state (such as
  looking up a configuration value in local storage). Because external systems can
  change, a query task should be rerun on each request, if possible.
  However, the result
  of a query task is still loaded into the kachery cache: this allows transfer of data between nodes, as well as providing a fallback result if the external resource
  that would be queried is not available.
  * *Actions* are tasks which change the state of some resource, for example appending to a feed. Action tasks do not return any
  substantive result, only the success or failure of the task. (TODO: do we guarantee each action is only run once?)

For more details, consult the [tasks documentation](./tasks.md).

These three types of data, collectively called *information* in these pages,
are stored in a distributed fashion among the users of the network. The documentation
[discusses the kachery storage model in detail](./storage.md).

Additionally, kachery supports permissions that [restrict access to data and compute resources](./security.md).

Finally, nodes may also store local data called *mutables* in a local filesystem database.
These are intended to be short-term volatile stores of convenience data (such as channel
or node aliases) and are not shared between nodes.

## Components of the kachery network

The kachery network consists of [kacheryhub](./hub.md),
[nodes](./node.md), and [channels](./channel.md). These are
discussed in more detail in their respective pages. Briefly:

* A **node** is a running instance of the kachery software: think of it as a computer
whose user would like to send or receive files. Communication on the network takes
place between nodes via channels.

* A **channel** defines a community of nodes that exhange files: the channel has
a unique identifier and a particular owner who can control access to it. It also
defines associated cloud storage and pub-sub communication resources which facilitate data transfer and interaction between nodes.

* Finally, **kacheryhub** is the website where a user
can create or manage channels, configure nodes, and where a channel owner
can control which nodes have permission to connect to the channel
and what actions they are allowed to take in the channel.

## Resources used by the kachery network

There are TODO:n types of external services and hardware used by the complete kachery network.
These are discussed in more detail in the [documentation on channels](./channel.md)
and on [how nodes communicate with each other](./node.md#Communication).

* **Nodes**: nodes are typically an instance of the kachery daemon running on some
machine (physical or vm). The node will require access to some sort of filesystem
which it can use for
[node-local file storage](./storage.md#Storage-Hierarchy)
(this can be a local file system or network-attached storage).
* **Buckets**: nodes do not interact directly with each other. In order to transfer
information from one node to another, the nodes in question need to have appropriate access
to a cloud storage space (e.g.
[Google Cloud Storage Bucket](https://cloud.google.com/storage/docs/creating-buckets)),
which acts as both a cache and a [bus](https://en.wikipedia.org/wiki/Bus_(computing))
over which information is transferred.
* **Publish/subscribe channel**: much the same as nodes use a cloud storage
bucket to transfer files, they also communicate requests and status messages
through a shared publish/subscribe message channel. This is presently implemented
through the [Ably](https://ably.com/pub-sub-messaging) service. A node requesting
a file will send a message to the corresponding channel,
and nodes with file-uploading permissions listen for requests and respond by uploading
the file to the cloud storage space. For more details, [see node.md](./node.md).
* **Federated authentication provider**: kacheryhub recognizes each node as being owned
by a particular user, who is declared when the daemon service for the node is started. That user can configure permissions for the node on kacheryhub. For more information, see the [documentation on the kacheryhub security model](./security.md).

## Software provided by kachery

The kachery network is realized through three main software artifacts:

* [kacheryhub](https://www.kacheryhub.org/) is a unique site, but its
[source code](https://github.com/kacheryhub/kacheryhub) is publicly available.

* [kachery-daemon](https://github.com/kacheryhub/kachery-daemon) is the software that
basic nodes run. It defines communication between the components of the kachery network,
as well as managing the local file store, and access to any defined computational resources.

* [kachery-client](https://github.com/kacheryhub/kachery-client) is a Python client
for interacting with a node. (The node may be a separate process running on the same
machine, or could be on a shared resource which multiple users might connect to.)
It also provides a command-line user interface to request or share files,
retrieve messages from feeds, etc. See documentation on
[setting up and using the kachery-client](./client-howto.md)

* kachery-js and kachery-react are typescript libraries for interacting with the kachery network from a web app. 
For instance, in the [sortingview](https://github.com/magland/sortingview)
tool, the web server running the labbox
software takes the place of a command-line client.

## What Can I Do With kachery?

If you want to send and receive files, you (or your administrator, for shared setups)
will need to install and run kachery-daemon on the machine that you intend to be the
host of the node. See [full setup instructions for a kachery node](./node-howto.md).
You will also need to use kacheryhub to connect your new node to the channel you'd
like to use to share data.

Once this is done, [install kachery-client](./client-howto.md) and you'll be ready to start!

More sophisticated setups are of course possible: the same tools can be used to build
web applications that act like nodes or make use of the [kachery-daemon API](./daemon-api.md).
The largest use of kachery is as a library to facilitate other applications, such as
web applications; see our [section on building projects that make use of kachery](./building.md).
