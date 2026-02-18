/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from '@jest/globals'
import { ALIAS_REGEX } from './alias.js'

describe('alias regex', () => {
  describe.each([
    '🍕',
    'pizza',
    'Pizza',
    'pizzä',
    'pißßa',
    'PiZzA🍕',
    'pi-zza',
    'pi_zza',
    '🧝‍♀️',
    '⚰️',
    '🏳️‍🌈',
    '🧑‍🧑‍🧒‍🧒',
    '🇩🇪',
  ])('allows', (testAlias) => {
    it(testAlias, () => {
      expect(ALIAS_REGEX.test(testAlias)).toBe(true)
    })
  })
  describe.each(['', '\t', '  ', '\u200D', '⌘', '𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅'])('forbids', (testAlias) => {
    it(testAlias, () => {
      expect(ALIAS_REGEX.test(testAlias)).toBe(false)
    })
  })
})
