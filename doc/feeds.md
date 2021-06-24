# Feeds

The kachery network allows users to share three different types of information:
files, feeds, and tasks.

## What are Feeds?

Feeds are collections of append-only logs: messages can be added to the log, but never
altered or taken away (except by deleting the entire feed). These provide
a permanent public record of any process that generates information with
a natural chronological ordering. Examples include data collected in a series, the
path of values in parameters of a machine learning model, the curation
actions applied to a data set by a lab researcher, a series of financial
transactions, the set of placements of opened windows in a user interface, etc.
The types of data that fall into this category are very broad.

In addition to tracking the history of a process, append-only logs are very useful for
ensuring reproducibility in states between different systems. Because
the log acts as a ledger that (when used properly) records every transition
from the initial state to the current state, a remote machine can be synced
to match the state of the feed originator simply by replaying the steps recorded
in the log. Moreover, because every message added to a feed needs to be signed
and added by the node that owns it, feeds automatically generate a canonical
ordering for potentially-ambiguous items.

### How are feeds different from files?

Since kachery files are stored in a content-addressable way, they can only
be retrieved if the file signature (SHA1 URI) is known. However, feeds are
meant to grow (until finalized)--if their content were known and fixed, they
would just be files! Instead, each feed is assigned a unique identifier, which
is also the [public part of a public-private keypair](./security.md#Feeds). The
node which owns the feed also keeps the private key, and signs each message which
is officially added to the feed. On the filesystem, the records which make up
the key are
[stored using the feed ID instead of a content hash](./storage.md#Organization-of-data-within-local-storage).

Feeds are also distinct from kachery files in that a feed has a specific
owner node. Files are content-addressable, and thus there is no hierarchy by
which one node's copy would be preferred over another node's--it doesn't matter
who contributed the file originally, only what the file contains. For feeds,
the node that owns the feed is the authoritative source of its contents, and the only entity that is allowed to append new messages.

Finally, because the messages added to an append-only log within a feed have an inherent ordering (and
earlier messages are immutable), a node requesting feed data can request the
messages after a specific point in time or can monitor new additions in real
time. These actions would not make sense in the context of a regular kachery file.

## Feed Structure

Each feed is a collection of *subfeeds*, which organize the messages appended to the
feed. (Messages are always associated with a specific subfeed, rather than the
feed as a whole, even if the feed has only one subfeed.)
Each subfeed has its own name (a key used to refer to the subfeed within the feed).
On local storage, feeds, subfeeds, and messages are all stored in a SQL database.

## Feed Security

As discussed in the [security model](./security.md#Feeds), each feed is owned by
a specific node which is the sole authority over its contents. The owner node
retains the private key corresponding to the public key represented by the
feed ID, and signs every new message appended to the feed. All nodes which
obtain feed data can verify its authenticity by checking this signature.

While the owner node is the sole author of feed contents, a feed owner can authorize other nodes to submit message to a subfeed via [action tasks](./tasks.md). The
[SortingView](https://github.com/magland/sortingview) electrophysiology
visualization application uses this approach to allow multiple researchers
to collaborate and contribute their analytical actions to a common lab record.

## Applications of Feeds

Feeds have a very wide variety of possible uses. Here are a few examples:

* SortingView uses feeds to
synchronize the workspace user interface state between different client
machines

* SortingView also uses feeds to log user curation actions applied to
electrophysiological data, providing an audit trail as well as reproducibility

* *This list is a stub; you can help by expanding it.*
