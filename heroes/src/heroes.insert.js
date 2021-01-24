const AWS = require('aws-sdk')
const uuid = require('uuid')

const dynamoDB = new AWS.DynamoDB.DocumentClient()

class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc
    this.dynamodbTable = process.env.DYNAMODB_TABLE
  }

  async insertItem(params) {
    return this.dynamoDbSvc.put(params).promise()
  }

  prepareData(data) {
    console.log('====> ', data)
    const params = {
      TableName: this.dynamodbTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString()
      }
    }

    return params
  }

  handlerSuccess(data) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data)
    }

    return response
  }

  handlerError(data) {
    const result = {
      statusCode: data.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: `Couldn't create item!!!`
    }
  }

  async main(event) {
    const data = JSON.parse(event.body)
    const dbParams = this.prepareData(data)
    await this.insertItem(dbParams)

    try {
      return this.handlerSuccess(dbParams.Item)
    } catch (error) {
      console.log('Error on insert data ', error.stack)
      return this.handlerError({ statusCode: 500 })
    }
  }
}

const handler = new Handler({
  dynamoDbSvc: dynamoDB
})
module.exports = handler.main.bind(handler)
