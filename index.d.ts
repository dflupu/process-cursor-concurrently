import {Cursor} from 'mongodb'

declare namespace processCursorConcurrently {
    export interface Options {
        /**
         * The maximum number of times that the handler function will be called concurrently.
         * Minimum: 1
         */
        concurrency: number;

        /**
         * Optional. A function that will be called each time an item is processed.
         */
        onProgress?: (countProcessed: number) => any;
    }

    export interface Results {
        countProcessed: number;
    }
}

/**
@param cursor - A mongodb cursor
@param handler - The function that will be called with each document
@param options

@example
```
const cursor = collection.find()
const handler = async doc => { await do_some_work(doc) }
const options = {concurrency: 10}

await processCursorConcurrently(cursor, handler, options)
```
*/
declare function processCursorConcurrently(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    cursor: Cursor,

    handler: (doc: object) => PromiseLike<any>,
    options?: processCursorConcurrently.Options
): Promise<processCursorConcurrently.Results>

export = processCursorConcurrently
