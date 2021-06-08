const text: string = "# How to host a kachery node\n\nYou can host a kachery node by running a kachery daemon on your computer. Once the daemon is running, you can register the node on kachery hub and configure the node using the web interface.\n\n## Requirements\n\nTested on Linux, should also work on macOS and Windows Subsystem for Linux\n\nWe recommend that you use a Conda environment with\n\n* Python >=3.8\n* NumPy\n* Nodejs >=12 (available on conda-forge; see below)\n\n## Installation using Conda\n\n```bash\nconda create --name kachery-env python=3.8 numpy>=1.19.0\nconda activate kachery-env\n\nconda install -c conda-forge nodejs\npip install --upgrade kachery-daemon\n\n# On macOS you may need to use the following to get a recent version of nodejs (>=12):\n# conda install nodejs -c conda-forge --repodata-fn=repodata.json\n```\n\n## Installation without conda\n\nIt is also possible to install without conda. Just make sure that the above requirements are met on your system, and then `pip install --upgrade kachery-daemon` as above.\n\n## Running the daemon\n\nEnsure you are in the correct conda environment, then:\n\n```bash\nkachery-daemon-start --label <name-of-node> --owner <your-google-account-id>\n```\n\nwhere `<name-of-node>` is a node label for display purposes and `<your-google-account-id>` must match the kachery hub login google account.\n\n\nKeep this daemon running in a terminal. You may want to use [tmux](https://github.com/tmux/tmux/wiki) or a similar tool to keep this daemon running even if the terminal is closed.\n\nOther more advanced options are available, such as specifying listen ports (see below).\n\n## Obtaining the node ID\n\nYou can obtain the unique ID for your running kachery node by using the following command:\n\n```bash\nkachery-daemon-info\n# will print the kachery node ID\n```\n\n## Adding the node on kachery hub\n\nTo add your node to kachery hub, make sure you are logged in to kachery hub using the same google account as specified in the --owner flag when running the daemon. Then click the `add kachery node` button and enter the node ID obtained above.\n\n## Advanced configuration\n\nEnvironment variables for the daemon\n\n* `KACHERY_STORAGE_DIR` **(optional)** - Refers to an existing directory on your local computer. This is where kachery stores all of your cached files. If not set, files will be stored in the default location: `$HOME/kachery-storage`.\n* `KACHERY_DAEMON_PORT` **(optional)** - Port that the daemon will listen on. If not provided, a default port will be used.\n\nEnvironment variables for the client\n\n* `KACHERY_DAEMON_PORT` **(optional)** - Port for connecting to the daemon (should match the above)\n* `KACHERY_DAEMON_HOST` **(optional)** - Host for connecting to the daemon\n* `KACHERY_TEMP_DIR` **(optional)** - Existing directory where temporary files are stored - not the same as `KACHERY_STORAGE_DIR`."

export default text