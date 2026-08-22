/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildStateFromUpdatedMarkdownContent } from './build-state-from-updated-markdown-content'
import { initialState } from './initial-state'

describe('build state from updated markdown content', () => {
  it('keeps the server title while the first heading is not extracted yet', () => {
    const actual = buildStateFromUpdatedMarkdownContent(
      { ...initialState, title: 'Server title', firstHeading: '' },
      '# Markdown heading'
    )

    expect(actual.title).toBe('Server title')
  })
})
