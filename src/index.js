import AWS from 'aws-sdk'
import { generate as shortid } from 'shortid'

// make working with dynamo simpler
// assumes all records have id field
// and always returns promises
export default class SimpleDynamo {
  constructor (TableName) {
    this.params = { TableName }
    this.db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
  }

  // use info in cloudformation to figure out table-name
  fromCloudFormation (table, stack) {
    return new Promise((resolve, reject) => {
      const cloudformation = new AWS.CloudFormation()
      cloudformation.listStackResources({ StackName: stack }, (err, data) => {
        if (err) {
          return reject(err)
        }
        this.params.TableName = data.StackResourceSummaries.find(r => r.LogicalResourceId === table).PhysicalResourceId
        resolve(this.params.TableName)
      })
    })
  }

  // get all records (with optional filter) see [AWS.DynamoDB.DocumentClient].scan
  async scan (options) {
    const o = {
      ...this.params,
      ...options
    }
    delete o.all
    const r = await this.db.scan(o).promise()
    if (!options.all) {
      return r.Items
    } else {
      if (r.LastEvaluatedKey) {
        return [...r.Items, ...(await this.scan({ ...options, ExclusiveStartKey: r.LastEvaluatedKey }))]
      } else {
        return r.Items
      }
    }
  }

  // query (with optional keys) see [AWS.DynamoDB.DocumentClient].query
  async query (options) {
    const o = {
      ...this.params,
      ...options
    }
    delete o.all
    const r = await this.db.query(o).promise()
    if (!options.all) {
      return r.Items
    } else {
      if (r.LastEvaluatedKey) {
        return [...r.Items, ...(await this.query({ ...options, ExclusiveStartKey: r.LastEvaluatedKey }))]
      } else {
        return r.Items
      }
    }
  }

  // get a single record by id, see [AWS.DynamoDB.DocumentClient].get
  async get (id, options) {
    const { Item } = await this.db.get({
      ...this.params,
      Key: { id },
      ...options
    }).promise()
    if (!Item) {
      throw new Error('Not found.')
    }
    return Item
  }

  // save a new record, see [AWS.DynamoDB.DocumentClient].put
  put (Item, options) {
    Item.id = Item.id || shortid()
    return this.db.put({
      ReturnValues: 'ALL_OLD',
      ...this.params,
      ...options,
      Item
    }).promise().then(() => Item)
  }

  // update a record, see [AWS.DynamoDB.DocumentClient].update
  update (updates, options) {
    const { id, ...newUpdates } = updates
    return this.db.update({
      ReturnValues: 'ALL_NEW',
      ...this.params,
      ...options,
      ...handleUpdates(newUpdates),
      Key: { id }
    }).promise().then(r => r.Attributes)
  }

  // delete a record, see [AWS.DynamoDB.DocumentClient].delete
  delete (id, options) {
    return this.db.delete({
      ReturnValues: 'ALL_OLD',
      ...this.params,
      ...options,
      Key: { id }
    }).promise().then(r => r.Attributes)
  }
}

// generate update query from an object
const handleUpdates = updates => {
  const expression = []
  const ExpressionAttributeValues = {}
  const ExpressionAttributeNames = {}
  Object.keys(updates).forEach(k => {
    expression.push(`#${k} = :${k}`)
    ExpressionAttributeValues[`:${k}`] = updates[k]
    ExpressionAttributeNames[`#${k}`] = k
  })
  return { UpdateExpression: `set ${expression.join(', ')}`, ExpressionAttributeValues, ExpressionAttributeNames }
}
