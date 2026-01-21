/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import type { NoteAliasesInterface } from '@hedgedoc/commons'
import { buildStateFromAliasesUpdate } from './build-state-from-aliases-update'

describe('build state from alias update', () => {
  it('creates a new state with the given aliases', () => {
    const state: NoteDetails = { ...initialState }
    const noteAliasesDto: NoteAliasesInterface = {
      primaryAlias: 'this-is-primary',
      aliases: ['this-is-primary', 'another-one']
    }
    expect(buildStateFromAliasesUpdate(state, noteAliasesDto)).toStrictEqual({
      ...state,
      primaryAlias: 'this-is-primary',
      aliases: ['this-is-primary', 'another-one']
    })
  })
})
