/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CursorSelection } from '../../../components/editor-page/editor-pane/tool-bar/formatters/types/cursor-selection'
import { initialState } from '../initial-state'
import { buildStateFromUpdateCursorPosition } from './build-state-from-update-cursor-position'
import { Mock } from 'ts-mockery'

describe('build state from update cursor position', () => {
  it('creates a new state with the given cursor', () => {
    const state = { ...initialState }
    const selection: CursorSelection = Mock.of<CursorSelection>()
    expect(buildStateFromUpdateCursorPosition(state, selection)).toStrictEqual({ ...state, selection })
  })
})
