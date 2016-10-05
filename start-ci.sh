#!/usr/bin/env bash

npm run test
if [ $? -ne 0 ]; then
  exit 1
fi

mkdir -p dynamoDB
cd dynamoDB
curl -L http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz | tar xz
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb &> /dev/null &
cd ..

WAITLIMIT=10

CURRENTWAIT=1
curl http://localhost:8000 &> /dev/null
while [ $? -ne 0 ]; do
  CURRENTWAIT=$((CURRENTWAIT+1))
  sleep 1
  echo "Waiting for local database..."
  if [ $CURRENTWAIT -gt $WAITLIMIT ]; then
    echo "Timeout waiting for local database"
    exit 1
  fi
  curl http://localhost:8000 &> /dev/null
done
echo "Local database ready."

node ./utility/db-utilities/initialize-tables.js

npm start -- --env e2e &> /dev/null &

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