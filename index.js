async function processCursorConcurrently(cursor, callable, options) {
    const {concurrency, onProgress} = options

    const promiseSlots = []

    let cursorHasMore = true
    let countProcessed = 0

    for (let slotIndex = 0; slotIndex < concurrency && cursorHasMore; ++slotIndex) {
        cursorHasMore = await startCallableInSlot(promiseSlots, slotIndex, cursor, callable)
    }

    while (cursorHasMore || promiseSlots.filter(Boolean).length > 0) {
        // If cursorHasMore is false, then some items in the promiseSlots array will be null.
        // We filter those because Promise.race would continuously return null otherwise
        const resolvedSlotIndex = await Promise.race(cursorHasMore ? promiseSlots : promiseSlots.filter(Boolean))
        promiseSlots[resolvedSlotIndex] = null

        countProcessed += 1

        if (onProgress) {
            onProgress(countProcessed)
        }

        if (!cursorHasMore) {
            continue
        }

        cursorHasMore = await startCallableInSlot(promiseSlots, resolvedSlotIndex, cursor, callable)
    }

    return {countProcessed}
}

async function startCallableInSlot(promiseSlots, slotIndex, cursor, callable) {
    const item = await cursor.next()

    if (!item) {
        return false
    }

    promiseSlots[slotIndex] = (async () => {
        await callable(item)
        return slotIndex
    })()

    return true
}

module.exports = processCursorConcurrently
