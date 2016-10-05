#!/usr/bin/env bash

export ELASTIC_BEANSTALK_LABEL=$(echo $TRAVIS_BRANCH | grep "^[0-9].[0-9].[0-9]-\?[a-zA-Z]*\.\?[0-9]*$")
SEMVER=$(echo $ELASTIC_BEANSTALK_LABEL | cut -d - -f 1)
if [ "$ELASTIC_BEANSTALK_LABEL" = "$SEMVER" ]; then
  export ENV_TAG="prod"
else
  export ENV_TAG=$(echo $ELASTIC_BEANSTALK_LABEL | cut -d - -f 2 | cut -d . -f 1 | grep "dev")
fi
export ELASTIC_BEANSTALK_ENV="quiet-goblin-"$ENV_TAG