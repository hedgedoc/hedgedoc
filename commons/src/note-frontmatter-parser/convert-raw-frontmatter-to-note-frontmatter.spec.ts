/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoteFrontmatter,
  NoteTextDirection,
  NoteType,
  OpenGraph,
} from '../note-frontmatter/frontmatter.js'
import { SlideOptions } from '../note-frontmatter/slide-show-options.js'
import { convertRawFrontmatterToNoteFrontmatter } from './convert-raw-frontmatter-to-note-frontmatter.js'
import { describe, expect, it } from '@jest/globals'

describe('convertRawFrontmatterToNoteFrontmatter', () => {
  it.each([false, true])(
    'returns the correct note frontmatter with `breaks: %s`',
    (breaks) => {
      const slideOptions: SlideOptions = {}
      const opengraph: OpenGraph = {}
      expect(
        convertRawFrontmatterToNoteFrontmatter({
          title: 'title',
          description: 'description',
          robots: 'robots',
          lang: 'de',
          type: NoteType.DOCUMENT,
          dir: NoteTextDirection.LTR,
          license: 'license',
          breaks: breaks,
          opengraph: opengraph,
          slideOptions: slideOptions,
          tags: 'tags',
        }),
      ).toStrictEqual({
        title: 'title',
        description: 'description',
        robots: 'robots',
        newlinesAreBreaks: breaks,
        lang: 'de',
        type: NoteType.DOCUMENT,
        dir: NoteTextDirection.LTR,
        opengraph: opengraph,
        slideOptions: slideOptions,
        license: 'license',
        tags: ['tags'],
      } as NoteFrontmatter)
    },
  )
})
