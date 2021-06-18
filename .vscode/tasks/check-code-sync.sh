#!/bin/bash

set -ex

jinjaroot synctool $PWD/src/kachery-js $PWD/../kachery-daemon/daemon/src/kachery-js $PWD/../surfaceview3/src/kachery-js $PWD/../sortingview/src/kachery-js --ask
jinjaroot synctool $PWD/../surfaceview3/src/kachery-react $PWD/../sortingview/src/kachery-react --ask
jinjaroot synctool $PWD/../surfaceview3/api $PWD/../sortingview/api --ask