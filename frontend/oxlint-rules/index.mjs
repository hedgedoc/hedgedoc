/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { translationKeysRule } from './translation-keys.mjs'

const plugin = {
  meta: {
    name: 'hedgedoc-frontend',
    version: '1.0.0'
  },
  rules: {
    'translation-keys': translationKeysRule
  }
}

export default plugin
