#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function onExit {
  docker kill $DOCKER_ID > /dev/null
}
trap onExit EXIT

# use docker AWS-cli, for less things to manually install
function aws {
  docker run --rm -it --network=host -v ${HOME}/.aws:/root/.aws -v ${DIR}:${DIR} amazon/aws-cli --endpoint-url=http://localhost:4566 --region us-west-2 $*
}

# run local dynamo & cloudformation
DOCKER_ID=$(docker run -d --rm --privileged \
  -e LOCALSTACK_SERVICES=dynamodb,cloudformation \
  -e DEBUG=1 \
  -e DEFAULT_REGION="us-west-2" \
  -e LOCALSTACK_HOSTNAME="localhost" \
  -e DOCKER_HOST="unix:///var/run/docker.sock" -e HOST_TMP_FOLDER="/tmp/localstack" \
  -p 4566-4620:4566-4620 \
  -v "/tmp/localstack:/tmp/localstack" -v "/var/run/docker.sock:/var/run/docker.sock" \
  "localstack/localstack")

# migrate cloudformation & create demo-data
until aws cloudformation list-stacks; do
  echo "waiting for localstack cloudformation…"
  sleep 3
done
aws cloudformation create-stack --stack-name simpledynamo --template-body "file://${DIR}/couldformation.test.yml" > /dev/null

node -r esm "${DIR}/test.js"