/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteFrontmatter, NoteTextDirection, NoteType } from './frontmatter.js'
import { SlideOptions } from './slide-show-options.js'

export const defaultSlideOptions: SlideOptions = {
  transition: 'zoom',
  autoSlide: 0,
  autoSlideStoppable: true,
  backgroundTransition: 'fade',
  slideNumber: false,
}

export const defaultNoteFrontmatter: NoteFrontmatter = {
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
  slideOptions: defaultSlideOptions,
}
