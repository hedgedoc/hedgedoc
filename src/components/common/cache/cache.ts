/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface CacheEntry<T> {
  entryCreated: number
  data: T
}

export class Cache<K, V> {
  readonly entryLifetime: number
  readonly maxEntries: number
  private store = new Map<K, CacheEntry<V>>()

  constructor(lifetime: number, maxEntries = 0) {
    if (lifetime < 0) {
      throw new Error('Cache entry lifetime can not be less than 0 seconds.')
    }
    this.entryLifetime = lifetime
    this.maxEntries = maxEntries
  }

  has(key: K): boolean {
    if (!this.store.has(key)) {
      return false
    }
    const entry = this.store.get(key)
    return (!!entry && entry.entryCreated >= (Date.now() - this.entryLifetime * 1000))
  }

  get(key: K): V {
    const entry = this.store.get(key)
    if (!entry) {
      throw new Error('This cache entry does not exist. Check with ".has()" before using ".get()".')
    }
    return entry.data
  }

  put(key: K, value: V): void {
    if (this.maxEntries > 0 && this.store.size === this.maxEntries) {
      this.store.delete(this.store.keys()
                            .next().value)
    }
    this.store.set(key, {
      entryCreated: Date.now(),
      data: value
    })
  }
}
