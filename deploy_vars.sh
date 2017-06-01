#!/usr/bin/env bash

export ELASTIC_BEANSTALK_LABEL=$(echo $TRAVIS_BRANCH | grep "^[0-9].[0-9].[0-9]-\?[a-zA-Z]*\.\?.*$")
export SEMVER=$(echo $ELASTIC_BEANSTALK_LABEL | cut -d - -f 1)
export ENV_TAG=$(if [ ${#ELASTIC_BEANSTALK_LABEL} -gt 0 -a $ELASTIC_BEANSTALK_LABEL = $SEMVER ]; then echo prod; else echo $ELASTIC_BEANSTALK_LABEL | cut -d - -f 2 | cut -d . -f 1 | grep "qa"; fi)
export ELASTIC_BEANSTALK_ENV="quiet-goblin-"$ENV_TAG