#!/bin/bash

set -ex

jinjaroot synctool $PWD/src/kachery-js $PWD/../kachery-daemon/daemon/src/kachery-js
jinjaroot synctool $PWD/src/kachery-js $PWD/../surfaceview3/src/python/surfaceview3/gui/labbox/kachery-js