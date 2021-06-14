#!/bin/bash

set -ex

jinjaroot synctool $PWD/src/common/types $PWD/../kachery-daemon/daemon/src/common/types
jinjaroot synctool $PWD/src/common/types $PWD/../surfaceview3/src/python/surfaceview3/gui/labbox/kachery-js/types