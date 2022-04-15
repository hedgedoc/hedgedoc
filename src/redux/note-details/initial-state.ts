/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import type { NoteDetails } from './types/note-details'
import { NoteTextDirection, NoteType } from './types/note-details'
import type { SlideOptions } from './types/slide-show-options'

export const initialSlideOptions: SlideOptions = {
  transition: 'zoom',
  autoSlide: 0,
  autoSlideStoppable: true,
  backgroundTransition: 'fade',
  slideNumber: false
}

export const initialState: NoteDetails = {
  updatedAt: DateTime.fromSeconds(0),
  updateUsername: null,
  version: 0,
  markdownContent: {
    plain: '',
    lines: [],
    lineStartIndexes: []
  },
  selection: { from: 0 },
  rawFrontmatter: '',
  frontmatterRendererInfo: {
    frontmatterInvalid: false,
    deprecatedSyntax: false,
    lineOffset: 0,
    slideOptions: initialSlideOptions
  },
  id: '',
  createdAt: DateTime.fromSeconds(0),
  aliases: [],
  primaryAddress: '',
  permissions: {
    owner: null,
    sharedToGroups: [],
    sharedToUsers: []
  },
  viewCount: 0,
  editedBy: [],
  title: '',
  firstHeading: '',
  frontmatter: {
    title: '',
    description: '',
    tags: [],
    deprecatedTagsSyntax: false,
    robots: '',
    lang: 'en',
    dir: NoteTextDirection.LTR,
    newlinesAreBreaks: true,
    GA: '',
    disqus: '',
    type: NoteType.DOCUMENT,
    opengraph: {},
    slideOptions: initialSlideOptions
  }
}
