const test = require('ava')

const {MongoClient} = require('mongodb')
const {MongoMemoryServer} = require('mongodb-memory-server')

const processCursorConcurrently = require('.')

let mongoCollection

test.before(async () => {
    const mongod = new MongoMemoryServer()
    const mongoUri = await mongod.getUri()

    const mongoClient = new MongoClient(mongoUri, {useUnifiedTopology: true})
    await mongoClient.connect()

    mongoCollection = mongoClient.db().collection('test')
})

test.beforeEach(async () => {
    await mongoCollection.deleteMany({})
})

test.serial('evenly divisible number of items', async t => {
    await testWithParameters(t, {itemCount: 100, concurrency: 10})
})

test.serial('non evenly divisible number of items', async t => {
    await testWithParameters(t, {itemCount: 101, concurrency: 10})
})

test.serial('zero items', async t => {
    await testWithParameters(t, {itemCount: 0, concurrency: 10})
})

test.serial('less items than concurrency', async t => {
    await testWithParameters(t, {itemCount: 1, concurrency: 5})
})

test.serial('concurrency set to 1', async t => {
    await testWithParameters(t, {itemCount: 10, concurrency: 1})
})

test.serial('sync function that throws', async t => {
    const itemCount = 100
    const cursor = await insertAndGetCursor(itemCount)

    let calls = 0

    await t.throwsAsync(processCursorConcurrently(cursor, _ => {
        calls += 1
        throw new Error('test')
    }, {concurrency: 10}))

    t.is(calls, 10)
})

test.serial('async function that throws', async t => {
    const itemCount = 100
    const cursor = await insertAndGetCursor(itemCount)

    let calls = 0

    await t.throwsAsync(processCursorConcurrently(cursor, async _ => {
        calls += 1

        return new Promise((resolve, reject) => {
            setTimeout(reject(new Error('test')), 1)
        })
    }, {concurrency: 10}))

    t.is(calls, 10)
})

test.serial('onProgress function is called', async t => {
    const progressCalls = []

    await testWithParameters(t, {
        itemCount: 101,
        concurrency: 10,
        onProgress: countProcessed => progressCalls.push(countProcessed)
    })

    t.is(progressCalls.length, 101)

    for (let i = 1; i <= 101; i++) {
        progressCalls.includes(i)
    }
})

async function testWithParameters(t, {itemCount, concurrency, onProgress}) {
    const cursor = await insertAndGetCursor(itemCount)
    const results = []

    await processCursorConcurrently(cursor, item => results.push(item), {concurrency, onProgress})
    t.is(results.length, itemCount)
}

async function insertAndGetCursor(itemCount) {
    for (let i = 0; i < itemCount; i++) {
        await mongoCollection.insertOne({_id: i})
    }

    return mongoCollection.find()
}
