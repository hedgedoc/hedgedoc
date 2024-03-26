/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EditorConfig } from './types'

export const initialState: EditorConfig = {
  ligatures: true,
  syncScroll: true,
  smartPaste: true,
  spellCheck: true,
  lineWrapping: true,
  indentWithTabs: false,
  indentSpaces: 2
}
