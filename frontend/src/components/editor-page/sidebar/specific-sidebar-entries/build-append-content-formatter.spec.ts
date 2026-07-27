/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildAppendContentFormatter } from './build-append-content-formatter'

describe('buildAppendContentFormatter', () => {
  it('appends content with a separator to an existing note', () => {
    const formatter = buildAppendContentFormatter('imported')

    expect(formatter({ markdownContent: 'existing', currentSelection: { from: 0, to: 0 } })).toEqual([
      [{ from: 8, to: 8, insert: '\nimported' }],
      undefined
    ])
  })

  it('does not add a separator to an empty note', () => {
    const formatter = buildAppendContentFormatter('imported')

    expect(formatter({ markdownContent: '', currentSelection: { from: 0, to: 0 } })).toEqual([
      [{ from: 0, to: 0, insert: 'imported' }],
      undefined
    ])
  })
})
