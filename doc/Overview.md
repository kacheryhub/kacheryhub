# kachery hub

Kachery hub is a
[permissioning system](https://www.kacheryhub.org/) and an
[umbrella name](https://github.com/kacheryhub/)
for a software suite which facilitates sharing data for scientific or technical research.

## What It Does

The kachery hub software suite facilitates sharing three types of data:

* **Files** are data files, of any size. Files over a certain size will be broken into
smaller pieces for transfer.

* **Feeds** are *append-only* logs, which operate like a digital
[lab notebook](https://en.wikipedia.org/wiki/Lab_notebook) or
[ledger](https://en.wikipedia.org/wiki/Ledger). Because such a feed is append-only
and signed, it presents a reliable history of actions taken by any agent; and
because it is complete, it offers a single source of truth from which the current
state of any system built on kachery can be reconstructed just by replaying the
log. For more details, consult the [feeds documentation](./feeds.md).

* **Tasks** are operations acting on files or feeds in the system. The system
supports three basic types of tasks:
  * *Pure computation tasks* are pure functions in the
  [computational](https://en.wikipedia.org/wiki/Pure_function)
  or [mathematical](https://en.wikipedia.org/wiki/Function_(mathematics)) sense.
  kachery provides a deterministic unique identifier for the combination
  of a pure function and the arguments it was called with, and maps that identifier to
  the result of the computation (stored in the file data store like any other file).
  The resulting cache saves duplicate calculations,
  which is particularly useful for computationally intensive processes.
  * *Queries* are tasks whose result depends on some external state (such as
  looking up a configuration value in local storage). These results depend on state from
  an external system, so the task should be executed whenever possible. However, the result
  of a query task is still loaded into the kachery cache: this allows transfer of large
  amounts of query data, as well as providing a fallback result if the external resource
  that would be queried is not available.
  * *Actions* are tasks which change the state of some external resource. [**NOTE: THIS IS
  SEPARATE FROM FEED UPDATES?**] [WHAT ADVANTAGES DO WE OFFER BY USING THIS--can we design
  to ensure that a given call is only executed once, etc?] Action tasks do not return any
  substantive result, only the success or failure of the task.

For more details, consult the [tasks documentation](./tasks.md).

These three types of data, collectively called *information* in these pages,
are stored in a distributed fashion among the users of the network. The documentation
[discusses the kachery storage model in detail](./storage.md).

Additionally, kachery is developed around a [robust security model](./security.md), to
ensure that information is shared only with intended parties.

Finally, nodes may also store local data called *mutables* in a local filesystem database.
These are intended to be short-term volatile stores of convenience data (such as channel
or node aliases) and are not discussed further here.

## Components of the kachery Network

The kachery network consists of [kachery hub](./hub.md),
[nodes](./node.md), and [channels](./channel.md). These are
discussed in more detail in their respective pages. Briefly:

* A **node** is a running instance of the kachery software: think of it as a computer
whose user would like to send or receive files. Communication on the network takes
place between nodes.

* A **channel** defines a community of nodes that exhange files: the channel has
a unique identifier and a particular owner who can control access to it.

* Finally, **kachery hub** is the webiste where a user
can create or subscribe to a channel, and where a channel owner
can control which nodes have permission to connect to the channel
and what actions they are allowed to take in the channel.

## Resources Used by kachery Network

There are n types of external services and hardware used by the complete kachery network.
These are discussed in more detail in the [documentation on channels](./channel.md)
and on [how nodes communicate with each other](./node.md#Communication).

* **Nodes**: nodes are typically an instance of the kachery daemon running on some
machine (physical or vm). The node will require access to some sort of filesystem
which it can use for
[node-local file storage](./storage.md#Storage-Hierarchy)
(this can be a local file system or network-attached storage).
* **Buckets**: nodes do not interact directly with each other. In order to transfer
files from one node to another, the nodes in question need to have appropriate access
to a cloud storage space (e.g.
[Google Cloud Storage Bucket](https://cloud.google.com/storage/docs/creating-buckets)),
which acts as a [bus](https://en.wikipedia.org/wiki/Bus_(computing))
over which files are transferred.
* **Publish/subscribe channel**: much the same as nodes use a cloud storage
bucket to transfer files, they also communicate requests and status messages
through a shared publish/subscribe message channel. This is presently implemented
through the [Ably](https://ably.com/pub-sub-messaging) service. A node requesting
a file (or feed, or task result) will send a message to the corresponding channel,
and nodes with file-uploading permissions listen for requests and respond by uploading
the file to the cloud storage space.
* **Federated authentication provider**: kachery hub recognizes each node as being owned
by a particular owner, who is declared when the daemon service is started. Permissions are
granted to a combination of the unique node ID (unique to the daemon software instance)
and the owner (identified by a command-line flag stating a Google account).
Node permissions are granted to a unique combination of node ID and owner ID, which ensures
access control even in shared environments. **QUERY: DOES IT?**
For more information, see the [documentation on the kachery hub security model](./security.md).

## Software provided by kachery hub

The kachery network is realized through three main software artifacts:

* [kachery hub](https://www.kacheryhub.org/) is a unique site, but its
[source code](https://github.com/kacheryhub/kacheryhub) is publicly available.

* [kachery-daemon](https://github.com/kacheryhub/kachery-daemon) is the software that
basic nodes run. It defines communication between the components of the kachery network,
as well as managing the local file store, and access to any defined computational resources.

* [kachery-client](https://github.com/kacheryhub/kachery-client) is a python client
for interacting with a node. (The node may be a separate process running on the same
machine, or could be on a shared resource which multiple users might connect to.)
It provides a command-line user interface to (for instance) request or share files,
retrieve messages from feeds, etc. See documentation on
[setting up and using the kachery-client](./client-howto.md)

Note that more sophisticated versions of these tools are also used other applications.
For instance, in the [sortingview](https://github.com/magland/sortingview)
tool, the web server running the labbox
software takes the place of a command-line client. Other web applications may provide
some of the functionality of a node and communicate with other nodes.

## What Can I Do With kachery?

If you want to send and receive files, you (or your administrator, for shared setups)
will need to install and run kachery-daemon on the machine that you intend to be the
host of the node. See [full setup instructions for a kachery node](./node-howto.md).
You will also need to use kachery hub to connect your new node to the channel you'd
like to use to share data.

Once this is done, [install kachery-client](./client-howto.md) and you'll be ready to start!

More sophisticated setups are of course possible: the same tools can be used to build
web applications that act like nodes or make use of the [kachery-daemon API](./daemon-api.md).
The largest use of kachery is as a library to facilitate other applications, such as
web applications; see our [section on building projects that make use of kachery](./building.md)
