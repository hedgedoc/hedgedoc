/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteDetails } from './types/note-details'
import { NoteTextDirection, NoteType } from '@hedgedoc/commons'
import type { SlideOptions } from '@hedgedoc/commons'

export const initialSlideOptions: SlideOptions = {
  transition: 'zoom',
  autoSlide: 0,
  autoSlideStoppable: true,
  backgroundTransition: 'fade',
  slideNumber: false
}

export const initialState: NoteDetails = {
  updateUsername: null,
  version: 0,
  markdownContent: {
    plain: '',
    lines: [],
    lineStartIndexes: []
  },
  selection: { from: 0 },
  rawFrontmatter: '',
  startOfContentLineOffset: 0,
  id: '',
  createdAt: 0,
  updatedAt: 0,
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
    robots: '',
    lang: 'en',
    dir: NoteTextDirection.LTR,
    newlinesAreBreaks: true,
    license: '',
    type: NoteType.DOCUMENT,
    opengraph: {},
    slideOptions: initialSlideOptions
  }
}
