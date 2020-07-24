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

It is assumed you are using cloudformation to provision.

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
        - AttributeName: expires
          AttributeType: "N"
      TimeToLiveSpecification:
        AttributeName: expires
        Enabled: true
      KeySchema:
        - AttributeName: id
          KeyType: HASH
        - AttributeName: expires
          KeyType: RANGE
      ProvisionedThroughput:
        ReadCapacityUnits: 1
        WriteCapacityUnits: 1
```

Now you can add these `scripts` to you package.json:

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

But it's much simpler to use env-vars or standard config.

### code

After it's setup, it pretty simple to use:

```js
const simpledynamo = require('@konsumer/simpledynamo')

// do any other config you need to, like above, but defaults should be fine, if everything is setup right.

// use in async functions for nice simple API
async function main() {
  // names come from above cloudformation examples: table, stack
  const stuff = await simpledynamo('MyStuff', 'dev')

  // scans are bad mmk?
  const things = await stuff.scan()
  console.log(things)
}
main()
```

#### API

<dl>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#batchGet-property">batchGet()</a> ⇒</dt>
<dd><p>Returns the attributes of one or more items from one or more tables by delegating to AWS.DynamoDB.batchGetItem().</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#batchWrite-property">batchWrite()</a> ⇒</dt>
<dd><p>Puts or deletes multiple items in one or more tables by delegating to AWS.DynamoDB.batchWriteItem().</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#createSet-property">createSet()</a> ⇒</dt>
<dd><p>Creates a set of elements inferring the type of set from the type of the first element.</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#delete-property">delete()</a> ⇒</dt>
<dd><p>Deletes a single item in a table by primary key by delegating to AWS.DynamoDB.deleteItem().</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property">get()</a> ⇒</dt>
<dd><p>Returns a set of attributes for the item with the given primary key by delegating to AWS.DynamoDB.getItem().</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property">put()</a> ⇒</dt>
<dd><p>Creates a new item, or replaces an old item with a new item by delegating to AWS.DynamoDB.putItem().</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property">query()</a> ⇒</dt>
<dd><p>Directly access items from a table by primary key or a secondary index.</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property">scan()</a> ⇒</dt>
<dd><p>Returns one or more items and item attributes by accessing every item in a table or a secondary index.</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#transactGet-property">transactGet()</a> ⇒</dt>
<dd><p>Atomically retrieves multiple items from one or more tables (but not from indexes) in a single account and region.</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#transactWrite-property">transactWrite()</a> ⇒</dt>
<dd><p>Synchronous write operation that groups up to 10 action requests.</p>
</dd>
<dt><a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property">update()</a> ⇒</dt>
<dd><p>Edits an existing item&#39;s attributes, or adds a new item to the table if it does not already exist by delegating to AWS.DynamoDB.updateItem().</p>
</dd>
</dl>
