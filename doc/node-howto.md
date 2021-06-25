# How to Run and Configure a kachery Node

Most of the action in the kachery network involves communication between
[nodes](./node.md). These are the network peers that exchange information
and maintain offline storage in the content-addressable database; nodes
may also optionally be the owners of [feeds](./feeds.md) or provide
[task execution resources](tasks.md).

To get started working with the kachery network, simply set up your
own node, register it with kachery hub, and join a channel. Once the
channel owner has granted your access permissions, you will be able
to exchange information with other nodes on the channel.

## Running a Node

*For the most up-to-date information on configuring a node, see
the [kacheryhub website](https://www.kacheryhub.org/home).*

A kachery node can be hosted on anything from a modest user machine
(such as a laptop) to a large shared lab resource with abundant
network-attached storage. A very straightforward model is to run
a node on your individual workstation or laptop. to do this, you will
need a POSIX-compliant environment capable of running Python >= 3.8, as
well as access to a network connection, and a free Google account for
authentication with kachery hub.

We highly recommend using Conda or another virtual-environment provider
when setting up your node, for ease of updates and to avoid potential
version conflict issues.

The basic setup looks like this:

```bash
conda create --name kachery-node-env python=3.8
conda activate kachery-node-env
# Linux version:
conda install -c conda-forge nodejs
# MacOS version, if the linux version does not give you nodejs >= 12:
# conda install nodejs -c conda-forge --repodata-fn=repodata.json
pip install --upgrade numpy kachery-daemon
# You may also choose to pip install --upgrade kachery-client, if you intend
# to use the same virtual environment for all kachery interactions.
kachery-daemon-start --label <WHATEVER YOU CHOOSE> --owner <YOUR GOOGLE ACCOUNT>
# The label flag can have any value: it will be visible on kachery hub, so it should be
# appropriate for public use, but it need not be unique.
# The owner flag should be passed a full Google account address, e.g.:
# --owner sergey.brin@google.com
```

Leave this running, and in another terminal window, use:
> `kachery-daemon-info`
to print the node ID of the running node.

You may find it convenient to use [tmux](https://github.com/tmux/tmux/wiki)
for terminal session management, instead of opening additional terminal
windows.

**QUESTION: DID WE DOUBLE-CHECK THAT REPODATA.JSON THING?**

Log in to kachery hub with the same google account you passed for the
`--owner` flag when starting
the daemon, then click the `add kachery node` button and follow the
instructions on screen to register your node.

You can now click on your node ID to join channels. Indicate the roles
you would like to perform, and inform the channel owner (through another
means of communication) of your name and node id. Once you've been authorized,
you can start using the client commands discussed in the
[kachery-client documentation](./client-howto.md).

## Advanced Configuration

**QUERY:** ARE THERE COMMAND-LINE OPTIONS FOR CONFIGURING PORTS ETC.
THAT WE SHOULD DISCUSS HERE?

### Configuring a remote node

TODO

### Configuration for task providers

TODO

## Environment Variables for kachery Nodes

* `KACHERY_STORAGE_DIR`: should be set to a directory where you would
like kachery to store files locally. This may require considerable space,
depending on how much data you intend to transfer. The user running the
`kachery-daemon` process will need read and write access to this directory.

  If it is unset, this directory will default to `$HOME/kachery-storage`.

* `KACHERY_DAEMON_PORT`: sets the port on which your instance of the
`kachery-daemon` process will listen for incoming connections from clients.
Note that this is not related to the communication with the channel or broader
kachery network; those communications happen via outbound requests on standard
HTTPS ports. This variable is only used to set the port over which you will
allow instances of the `kachery-client` application to communicate with your
node, in the event you are providing services as a remote node.
