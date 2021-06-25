# kachery

Kachery is a *mediated peer-to-peer* information-transfer network for sharing scientific data files, live feeds, and calculation results between remote workstations and between lab computers and a browser-based user interfaces in the cloud.

## Sharing data between remote workstations using Python

The easiest way to share scientific data using kachery is via the [kachery-client](https://github.com/kacheryhub/kachery-client) Python package. After starting a [kachery daemon](https://github.com/kacheryhub/kachery-daemon) on your local computer, you can store data to the kachery network in the following manner:

```python
import kachery_client as kc

# You need to be running a kachery daemon.
# If you want to share these data with remote
# computers, then your kachery node must be
# configured to provide files on some channel,
# and the remote computers must be configured
# to request files on that channel.

# Share some text
uri = kc.store_text('some-random-text')
print(uri)
# Output: sha1://6af826b3d648ccba6b4bbe58e93e22add640d728/file.txt

# Later on retrieve the text by its content URI
txt = kc.load_text('sha1://6af826b3d648ccba6b4bbe58e93e22add640d728/file.txt')
print(txt)
# Output: some-random-text

# Similarly, you can store/share json-able Python dicts,
# numpy arrays, or pickle-able Python objects
import numpy as np
uri_dict = kc.store_json({'a': [1, 2, {'b': 3}]})
uri_npy = kc.store_npy(np.ones((10, 20)))
uri_pkl = kc.store_pkl({'x': np.zeros((30, 40))})

# And retrieve then at a later time
X_dict = kc.load_json(uri_dict)
X_npy = kc.load_npy(uri_npy)
X_pkl = kc.load_pkl(uri_pkl)
```

Those URIs can be used to retrieve the text on a remote computer, provided that the remote computer is also running a kachery daemon, the local and remote nodes belong to a [common channel](./doc/channel.md), the local node is configured to provide files on that channel, and the remote node is configured to request files on that channel.

```python
import kachery_client as kc

# Run this on a remote machine.

# You need to be running a kachery daemon,
# and your kachery node must be configured
# to request files on the channel containing
# the file.

txt = kc.load_text('sha1://6af826b3d648ccba6b4bbe58e93e22add640d728/file.txt')
print(txt)
# Output: some-random-text
```

