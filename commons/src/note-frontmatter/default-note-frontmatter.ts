/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NoteType } from './note-type.js'
import { NoteTextDirection } from './note-text-direction.js'

export const defaultNoteFrontmatter = {
  title: '',
  description: '',
  tags: [],
  type: NoteType.DOCUMENT as const,
  breaks: true,
  dir: NoteTextDirection.LTR,
  robots: '',
  lang: 'en' as const,
  license: '',
  opengraph: {},
  slideOptions: {
    transition: 'zoom',
    autoSlide: 0,
    autoSlideStoppable: true,
    backgroundTransition: 'fade',
    slideNumber: false,
  } as const,
}
