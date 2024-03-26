/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Takes a string-keyed object and updates it with the values of another object while ensuring that the types match.
 * Keys in the new object, that are not present in the old object will be ignored.
 * This is useful for updating a state object with data from an API response or local storage.
 * The method operates in-place on the old object, instead of returning a new object to reduce memory usage.
 *
 * @param oldObject The object to update.
 * @param newValues The object containing the new values.
 */
export const updateObject = <T extends Record<string, unknown>>(oldObject: T, newValues: T | null): void => {
  if (typeof newValues !== 'object' || newValues === null) {
    return
  }
  Object.keys(oldObject).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(newValues, key) && typeof oldObject[key] === typeof newValues[key]) {
      // TypeScript does not allow to assign a value to a key of a generic object (as it could be potentially readonly)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      oldObject[key] = newValues[key]
    }
  })
}
