/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { initialState } from '../initial-state'
import { buildStateFromFirstHeadingUpdate } from './build-state-from-first-heading-update'
import { describe, expect, it, vitest, beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

// noinspection JSUnusedGlobalSymbols
vi.mock(
  '@hedgedoc/commons',
  async (importOriginal) =>
    ({
      ...(await importOriginal()),
      generateNoteTitle: () => 'generated title'
    }) as Record<string, unknown>
)

describe('build state from first heading update', () => {
  it('generates a new state with the given first heading', () => {
    const startState = { ...initialState, firstHeading: 'heading', title: 'noteTitle' }
    const actual = buildStateFromFirstHeadingUpdate(startState, 'new first heading')
    expect(actual).toStrictEqual({ ...initialState, firstHeading: 'new first heading', title: 'generated title' })
  })
})
