const AWS = require('aws-sdk')

module.exports = (table, stack) => new Promise((resolve, reject) => {
  const cloudformation = new AWS.CloudFormation()
  cloudformation.listStackResources({ StackName: stack }, (err, data) => {
    if (err) {
      return reject(err)
    }

    // find the real name of my dynamodb table
    const TableName = data.StackResourceSummaries.find(r => r.LogicalResourceId === table).PhysicalResourceId

    // wrap DocumentClient with default TableName and promise
    const ddoc = new AWS.DynamoDB.DocumentClient()
    resolve({
      /**
       * Returns the attributes of one or more items from one or more tables by delegating to AWS.DynamoDB.batchGetItem().
       * @returns AWS.Request
       */
      batchGet: (params) => ddoc.batchGet({ TableName, ...params }).promise(),

      /** Puts or deletes multiple items in one or more tables by delegating to AWS.DynamoDB.batchWriteItem().
       * @returns AWS.Request
       */
      batchWrite: (params) => ddoc.batchWrite({ TableName, ...params }).promise(),

      /**
       * Creates a set of elements inferring the type of set from the type of the first element.
       * @returns void
       */
      createSet: (list, options) => ddoc.createSet(list, options),

      /**
       * Deletes a single item in a table by primary key by delegating to AWS.DynamoDB.deleteItem().
       * @returns AWS.Request
       */
      delete: (params) => ddoc.delete({ TableName, ...params }).promise(),

      /**
       * Returns a set of attributes for the item with the given primary key by delegating to AWS.DynamoDB.getItem().
       * @returns AWS.Request
       */
      get: (params) => ddoc.get({ TableName, ...params }).promise(),

      /**
       * Creates a new item, or replaces an old item with a new item by delegating to AWS.DynamoDB.putItem().
       * @returns AWS.Request
       */
      put: (params) => ddoc.put({ TableName, ...params }).promise(),

      /**
       * Directly access items from a table by primary key or a secondary index.
       * @returns AWS.Request
       */
      query: (params) => ddoc.query({ TableName, ...params }).promise(),

      /**
       * Returns one or more items and item attributes by accessing every item in a table or a secondary index.
       * @returns AWS.Request
       */
      scan: (params) => ddoc.scan({ TableName, ...params }).promise(),

      /**
       * Atomically retrieves multiple items from one or more tables (but not from indexes) in a single account and region.
       * @returns AWS.Request
       */
      transactGet: (params) => ddoc.transactGet({ TableName, ...params }).promise(),

      /**
       * Synchronous write operation that groups up to 10 action requests.
       * @returns AWS.Request
       */
      transactWrite: (params) => ddoc.transactWrite({ TableName, ...params }).promise(),

      /**
       * Edits an existing item's attributes, or adds a new item to the table if it does not already exist by delegating to AWS.DynamoDB.updateItem().
       * @returns AWS.Request
       */
      update: (params) => ddoc.update({ TableName, ...params }).promise()
    })
  })
})
