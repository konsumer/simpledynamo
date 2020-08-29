import BareTest from 'baretest'
import { strict as assert } from 'assert'
import AWS from 'aws-sdk'
import SimpleDynamo from './index'

const test = BareTest('simpledynamo')

const { DYNAMO_ENDPOINT = "http://localhost:4566", DYNAMO_REGION = "us-west-2", DYNAMO_ACCESS_KEY_ID = "FAKE", DYNAMO_SECRET_ACCESS_KEY = "FAKE" } = process.env

AWS.config.update({
  region: DYNAMO_REGION,
  accessKeyId: DYNAMO_ACCESS_KEY_ID,
  secretAccessKey: DYNAMO_SECRET_ACCESS_KEY,
  endpoint: DYNAMO_ENDPOINT
})

const db = new SimpleDynamo()

let testID

test('fromCloudFormation', async () => {
  assert(await db.fromCloudFormation("MyStuff", "simpledynamo"))
})

test('put', async () => {
  const newRecord = await db.put({
    name: "Nice Shirt",
    type: "shirt"
  })
  assert.equal(newRecord.name, "Nice Shirt")
  assert.equal(newRecord.type, "shirt")
  assert(newRecord.id)
  testID = newRecord.id
})

test('update', async () => {
  const newRecord = await db.update({
    id: testID,
    name: "A Really Nice Shirt",
  })
  assert.equal(newRecord.name, "A Really Nice Shirt")
  assert.equal(newRecord.type, "shirt")
})

test('get', async () => {
  const newRecord = await db.get(testID)
  assert.equal(newRecord.name, "A Really Nice Shirt")
  assert.equal(newRecord.type, "shirt")
})

test('scan', async () => {
  const records = await db.scan()
  assert(records[0])
  assert.equal(records[0].name, "A Really Nice Shirt")
  assert.equal(records[0].type, "shirt")
})

test('query', async () => {
  const records = await db.query({
    IndexName: 'byType',
    KeyConditionExpression: '#type = :type',
    ExpressionAttributeValues: {
      ':type': "shirt"
    },
    ExpressionAttributeNames: {
      '#type': 'type'
    }
  })
  assert(records[0])
  assert.equal(records[0].name, "A Really Nice Shirt")
  assert.equal(records[0].type, "shirt")
})

test('delete', async () => {
  const oldRecord = await db.delete(testID)
  assert.equal(oldRecord.name, "A Really Nice Shirt")
  assert.equal(oldRecord.type, "shirt")
  try {
    const newRecord = await db.get(testID)
  } catch (e) {
    assert.equal(e.message, "Not found.")
  }
})

test.run()
