import { Cache } from './cache'

describe('Test caching functionality', () => {
  let testCache: Cache<string, number>

  beforeEach(() => {
    testCache = new Cache<string, number>(1000)
  })

  it('initialize with right lifetime, no entry limit', () => {
    const lifetime = 1000
    const lifetimedCache = new Cache<string, string>(lifetime)
    expect(lifetimedCache.entryLifetime).toEqual(lifetime)
    expect(lifetimedCache.maxEntries).toEqual(0)
  })

  it('initialize with right lifetime, given entry limit', () => {
    const lifetime = 1000
    const maxEntries = 10
    const limitedCache = new Cache<string, string>(lifetime, maxEntries)
    expect(limitedCache.entryLifetime).toEqual(lifetime)
    expect(limitedCache.maxEntries).toEqual(maxEntries)
  })

  it('entry exists after inserting', () => {
    testCache.put('test', 123)
    expect(testCache.has('test')).toBe(true)
  })

  it('entry does not exist prior inserting', () => {
    expect(testCache.has('test')).toBe(false)
  })

  it('entry does expire', () => {
    const shortLivingCache = new Cache<string, number>(2)
    shortLivingCache.put('test', 123)
    expect(shortLivingCache.has('test')).toBe(true)
    setTimeout(() => {
      expect(shortLivingCache.has('test')).toBe(false)
    }, 2000)
  })

  it('entry value does not change', () => {
    const testValue = Date.now()
    testCache.put('test', testValue)
    expect(testCache.get('test')).toEqual(testValue)
  })

  it('error is thrown on non-existent entry', () => {
    const accessNonExistentEntry = () => {
      testCache.get('test')
    }
    expect(accessNonExistentEntry).toThrow(Error)
  })

  it('newer item replaces older item', () => {
    testCache.put('test', 123)
    testCache.put('test', 456)
    expect(testCache.get('test')).toEqual(456)
  })

  it('entry limit is respected', () => {
    const limitedCache = new Cache<string, number>(1000, 2)
    limitedCache.put('first', 1)
    expect(limitedCache.has('first')).toBe(true)
    expect(limitedCache.has('second')).toBe(false)
    expect(limitedCache.has('third')).toBe(false)
    limitedCache.put('second', 2)
    expect(limitedCache.has('first')).toBe(true)
    expect(limitedCache.has('second')).toBe(true)
    expect(limitedCache.has('third')).toBe(false)
    limitedCache.put('third', 3)
    expect(limitedCache.has('first')).toBe(false)
    expect(limitedCache.has('second')).toBe(true)
    expect(limitedCache.has('third')).toBe(true)
  })
})
