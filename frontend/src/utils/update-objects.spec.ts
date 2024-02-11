/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { updateObject } from './update-object'

describe('updateObject', () => {
  it('should not update the object if newValues is not an object', () => {
    const oldObject = { a: 1, b: 2 }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    updateObject(oldObject, 'abc')
    expect(oldObject).toEqual({ a: 1, b: 2 })
  })

  it('should not update the object if newValues is null', () => {
    const oldObject = { a: 1, b: 2 }
    updateObject(oldObject, null)
    expect(oldObject).toEqual({ a: 1, b: 2 })
  })

  it('should update the object with the new values', () => {
    const oldObject = { a: 1, b: 2 }
    const newValues = { a: 3, b: 4 }
    updateObject(oldObject, newValues)
    expect(oldObject).toEqual({ a: 3, b: 4 })
  })

  it('should ignore keys that are not present in the old object', () => {
    const oldObject = { a: 1, b: 2 }
    const newValues = { a: 3, b: 4, c: 5 }
    updateObject(oldObject, newValues)
    expect(oldObject).toEqual({ a: 3, b: 4 })
  })

  it('should ignore keys with different types', () => {
    const oldObject = { a: 1, b: 2 }
    const newValues = { a: '3', b: 4 }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    updateObject(oldObject, newValues)
    expect(oldObject).toEqual({ a: 1, b: 4 })
  })
})
