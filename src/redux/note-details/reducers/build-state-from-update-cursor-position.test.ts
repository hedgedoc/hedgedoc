/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { initialState } from '../initial-state'
import type { CursorSelection } from '../../editor/types'
import { Mock } from 'ts-mockery'
import { buildStateFromUpdateCursorPosition } from './build-state-from-update-cursor-position'

describe('build state from update cursor position', () => {
  it('creates a new state with the given cursor', () => {
    const state = { ...initialState }
    const selection: CursorSelection = Mock.of<CursorSelection>()
    expect(buildStateFromUpdateCursorPosition(state, selection)).toStrictEqual({ ...state, selection })
  })
})
