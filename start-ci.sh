#!/usr/bin/env bash

npm run test
if [ $? -ne 0 ]; then
  exit 1
fi

npm start -- --env e2e &> /dev/null &

WAITLIMIT=10
CURRENTWAIT=1
curl http://localhost:7003 &> /dev/null
while [ $? -ne 0 ]; do
  CURRENTWAIT=$((CURRENTWAIT+1))
  sleep 1
  echo "Waiting for quiet-goblin..."
  if [ $CURRENTWAIT -gt $WAITLIMIT ]; then
    echo "Timeout waiting for quiet-goblin"
    exit 1
  fi
  curl http://localhost:7003 &> /dev/null
done
echo "Application Ready."

npm run e2e
