#!/usr/bin/env bash

rm -rf $PUBLIC_DIR
echo "++++++  Installing UI application: "$RAGING_GOBLIN_TAG
curl https://s3-us-west-2.amazonaws.com/raging-goblin-ui/$RAGING_GOBLIN_TAG.tar.gz | tar -xvz -C $ROOT
echo "++++++  UI application installed."