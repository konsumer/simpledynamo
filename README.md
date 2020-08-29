# simple dynamo

[![npm version](https://badge.fury.io/js/%40konsumer%2Fsimpledynamo.svg)](https://badge.fury.io/js/%40konsumer%2Fsimpledynamo)

This is meant to simplify dynamodb access.

It wraps the [document client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html) in promises, and has a helper if you are using cloudformation to track build/destroy of your dynamo resources.

It's a thin wrapper, but it's boilerplate I kept having to write, so this should save everyone a little time.

### installation

Install in your project:

```sh
npm i @konsumer/simpledynamo
```

## usage

### config & provisioning

Cloudformation is a nice way to provision your resources, and there is a helper function `fromCloudFormation(table, stack)` to set the table-name.

Setup a `cloudformation.yml` description of your databases. Here is an example with `id` and `expires` PK/SK, and `expires` is set as the TTL field (so it will automatically delete records that are expired.) Read more about setting up tables, [here](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html). Another common thing I setup a lot here are `GlobalSecondaryIndexes`.

```yml
AWSTemplateFormatVersion: 2010-09-09
Description: My Stuff
Resources:
  MyStuff:
    Type: 'AWS::DynamoDB::Table'
    DeletionPolicy: Delete
    Properties:
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: "S"
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      ProvisionedThroughput:
        ReadCapacityUnits: 1
        WriteCapacityUnits: 1
```

Now you can add these `scripts` to your package.json:

```json
{
  "setup": "aws cloudformation create-stack --region us-west-2 --stack-name dev --template-body file://cloudformation.yml",
  "update": "aws cloudformation update-stack --region us-west-2 --stack-name dev --template-body file://cloudformation.yml",
  "destroy": "aws cloudformation delete-stack --region us-west-2 --stack-name dev"
}
```

Make sure you have setup [aws-cli](https://aws.amazon.com/cli/) and have your credentials in `~/.aws`. You can also use [AWS environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html). This will be the default AWS settings. If you need to configure it in code, in some other way, you can also run something like this:

```js
const AWS = require('aws-sdk')
AWS.config.update({
  region: DYNAMO_REGION,
  accessKeyId: DYNAMO_ACCESS_KEY_ID,
  secretAccessKey: DYNAMO_SECRET_ACCESS_KEY
})
```

But it's much simpler to use env-vars or standard config, and not configure it at all.

### code

After it's setup, it pretty simple to use:

```js
const SimpleDynamo = require('@konsumer/simpledynamo')

// do any other config you need to, like above, but defaults should be fine, if everything is setup right.

// use in async functions for nice simple API
async function main() {
  const stuff = new SimpleDynamo()

  // names come from above cloudformation examples: table, stack
  await stuff.fromCloudFormation('MyStuff', 'dev')

  // scans are bad mmk?
  const things = await stuff.scan()
  console.log(things)
}
main()
```

There are some additional helpers and improvements to [document client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html) , like update is object-based, and everything returns a reasonable record of the change you made:

```js
const updatedItem = await things.update({
  id: 'eWRhpRV' // REQUIRED: it uses this to find the record
  name: "Cool Guy"
})
```


### TODO

* make keys work more dynamically
* auto-generate `query` more like update