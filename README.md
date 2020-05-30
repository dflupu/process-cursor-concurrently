# process-cursor-concurrently

> Iterate a Mongodb cursor and handle results concurrently, up to a set limit

Useful when you do not want to load the whole collection in memory.

## Install
```sh
npm install --save process-cursor-concurrently
```

## Usage
```javascript
const processCursorConcurrently = require('process-cursor-concurrently')

const cursor = collection.find()
const handler = async doc => { /* do some work */ }

await processCursorConcurrently(cursor, handler, {concurrency: 10})
```

## API

### processCursorConcurrently(cursor, handler, options)

Type: async function

Returns: {countProcessed: number}

##### cursor

Type: mongodb.Cursor

A mongodb cursor instance

##### handler

Type: async function

The function that will be called with each document

##### options

Type: object

###### options.concurrency

Type: number

The maximum number of times that the handler function will be called concurrently.

##### options.onProgress(countProcessed: number)?

Type: function

Optional. A function that will be called each time an item is processed.

