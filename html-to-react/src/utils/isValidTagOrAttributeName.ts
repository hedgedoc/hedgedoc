/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_.\-\d]*$/
const nameCache: Record<string, boolean> = {}

export function isValidTagOrAttributeName(tagName: string): boolean {
  if (!(tagName in nameCache)) {
    nameCache[tagName] = VALID_TAG_REGEX.test(tagName)
  }
  return nameCache[tagName]
}
