#!/bin/bash

set -ex

jinjaroot generate
exec .vscode/tasks/create_doc_ts_file.py
exec .vscode/tasks/create_gen_ts_files.py