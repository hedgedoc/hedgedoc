/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoteFrontmatter,
  NoteTextDirection,
  NoteType,
} from '../note-frontmatter/frontmatter.js'
import { generateNoteTitle } from './generate-note-title.js'
import { describe, expect, it } from '@jest/globals'

const testFrontmatter: NoteFrontmatter = {
  title: '',
  description: '',
  tags: [],
  robots: '',
  lang: 'en',
  dir: NoteTextDirection.LTR,
  newlinesAreBreaks: true,
  license: '',
  type: NoteType.DOCUMENT,
  opengraph: {},
  slideOptions: {
    transition: 'zoom',
    autoSlide: 0,
    autoSlideStoppable: true,
    backgroundTransition: 'fade',
    slideNumber: false,
  },
}

describe('generate note title', () => {
  it('will choose the frontmatter title first', () => {
    const actual = generateNoteTitle(
      {
        ...testFrontmatter,
        title: 'frontmatter',
        opengraph: { title: 'opengraph' },
      },
      () => 'first-heading',
    )
    expect(actual).toEqual('frontmatter')
  })

  it('will choose the opengraph title second', () => {
    const actual = generateNoteTitle(
      { ...testFrontmatter, opengraph: { title: 'opengraph' } },
      () => 'first-heading',
    )
    expect(actual).toEqual('opengraph')
  })

  it('will choose the first heading third', () => {
    const actual = generateNoteTitle(
      { ...testFrontmatter },
      () => 'first-heading',
    )
    expect(actual).toEqual('first-heading')
  })
})
