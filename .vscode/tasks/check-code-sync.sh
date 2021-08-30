#!/bin/bash

set -ex

jinjaroot synctool $PWD/src/kachery-js $PWD/../kachery-daemon/daemon/src/kachery-js $PWD/../surfaceview3/src/kachery-js $PWD/../figurl/src/kachery-js --ask