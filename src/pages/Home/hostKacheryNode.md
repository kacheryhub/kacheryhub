# How to host a kachery node

You can host a kachery node by running a kachery daemon on your computer. Once the daemon is running, you can register the node on kachery hub and configure the node using the web interface.

## Requirements

Tested on Linux, should also work on macOS and Windows Subsystem for Linux

We recommend that you use a Conda environment with

* Python >=3.8
* NumPy
* Nodejs >=12 (available on conda-forge; see below)

## Installation using Conda

```bash
conda create --name kachery-env python=3.8 numpy>=1.19.0
conda activate kachery-env

conda install -c conda-forge nodejs
pip install --upgrade kachery-daemon

# On macOS you may need to use the following to get a recent version of nodejs (>=12):
# conda install nodejs -c conda-forge --repodata-fn=repodata.json
```

## Installation without conda

It is also possible to install without conda. Just make sure that the above requirements are met on your system, and then `pip install --upgrade kachery-daemon` as above.

## Running the daemon

Ensure you are in the correct conda environment, then:

```bash
kachery-daemon-start --label <name-of-node> --owner <your-google-account-id>
```

where `<name-of-node>` is a node label for display purposes and `<your-google-account-id>` must match the kachery hub login google account.


Keep this daemon running in a terminal. You may want to use [tmux](https://github.com/tmux/tmux/wiki) or a similar tool to keep this daemon running even if the terminal is closed.

Other more advanced options are available, such as specifying listen ports (see below).

## Obtaining the node ID

You can obtain the unique ID for your running kachery node by using the following command:

```bash
kachery-daemon-info
# will print the kachery node ID
```

## Adding the node on kachery hub

To add your node to kachery hub, make sure you are logged in to kachery hub using the same google account as specified in the --owner flag when running the daemon. Then click the `add kachery node` button and enter the node ID obtained above.

## Advanced configuration

Environment variables for the daemon

* `KACHERY_STORAGE_DIR` **(optional)** - Refers to an existing directory on your local computer. This is where kachery stores all of your cached files. If not set, files will be stored in the default location: `$HOME/kachery-storage`.
* `KACHERY_DAEMON_PORT` **(optional)** - Port that the daemon will listen on. If not provided, a default port will be used.

Environment variables for the client

* `KACHERY_DAEMON_PORT` **(optional)** - Port for connecting to the daemon (should match the above)
* `KACHERY_DAEMON_HOST` **(optional)** - Host for connecting to the daemon
* `KACHERY_TEMP_DIR` **(optional)** - Existing directory where temporary files are stored - not the same as `KACHERY_STORAGE_DIR`.