/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const updateObject = <T extends Record<string, unknown>>(oldObject: T, newValues: T | null): void => {
  if (typeof newValues !== 'object' || newValues === null) {
    return
  }
  Object.keys(oldObject).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(newValues, key) && typeof oldObject[key] === typeof newValues[key]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      oldObject[key] = newValues[key]
    }
  })
}
