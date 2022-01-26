/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { generateNoteTitle } from './generate-note-title'
import { initialState } from './initial-state'

describe('generate note title', () => {
  it('will choose the frontmatter title first', () => {
    const actual = generateNoteTitle(
      { ...initialState.frontmatter, title: 'frontmatter', opengraph: { title: 'opengraph' } },
      'first-heading'
    )
    expect(actual).toEqual('frontmatter')
  })

  it('will choose the opengraph title second', () => {
    const actual = generateNoteTitle(
      { ...initialState.frontmatter, opengraph: { title: 'opengraph' } },
      'first-heading'
    )
    expect(actual).toEqual('opengraph')
  })

  it('will choose the first heading third', () => {
    const actual = generateNoteTitle({ ...initialState.frontmatter }, 'first-heading')
    expect(actual).toEqual('first-heading')
  })
})
