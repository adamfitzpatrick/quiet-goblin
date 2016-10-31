#!/usr/bin/env bash

git clone https://github.com/adamfitzpatrick/raging-goblin.git .raging-goblin
cd .raging-goblin
git fetch --all
git checkout $1

npm i
if [ $? -ne 0 ]; then exit 1; fi

webpack -p
if [ $? -ne 0 ]; then exit 1; fi

rm -rf ../public
cp -R public ../public
cd ..
rm -rf .raging-goblin
