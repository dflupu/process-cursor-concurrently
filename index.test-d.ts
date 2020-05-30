import {expectType} from 'tsd'
import processCursorConcurrently = require('.')

import {MongoClient} from 'mongodb'
import {MongoMemoryServer} from 'mongodb-memory-server'

const mongod = new MongoMemoryServer()
const mongoUri = await mongod.getUri()

const mongoClient = new MongoClient(mongoUri, {useUnifiedTopology: true})
await mongoClient.connect()

const mongoCollection = mongoClient.db().collection('test')

for (let i = 0; i < 10; i++) {
    await mongoCollection.insertOne({_id: i})
}

const cursor = mongoCollection.find()
const p = processCursorConcurrently(cursor, async item => expectType<object>(item), {concurrency: 10})

expectType<Promise<processCursorConcurrently.Results>>(p)
