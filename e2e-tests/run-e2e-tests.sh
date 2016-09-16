#!/usr/bin/env bash

npm start -- --env e2e &> /dev/null &

READY=1
while [ $READY -ne 0 ]; do
    echo "Waiting for application to be ready..."
    curl -s -o /dev/null http://localhost:7003 2>&1
    READY=$?
    sleep 1
done

cd e2e-tests
for i in "$@"; do
    if [[ $i -eq "w" ]]; then
        WATCH=true
    fi
done

if [ $WATCH ]; then
    mocha --watch
else
    mocha
fi

kill $(ps -o pid,command | grep e2e | grep -v grep | awk '{print $1}')