/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NoteDetails } from './types'
import { DateTime } from 'luxon'
import { NoteTextDirection, NoteType, SlideOptions } from '../../components/common/note-frontmatter/types'

export const initialSlideOptions: SlideOptions = {
  transition: 'zoom',
  autoSlide: 0,
  autoSlideStoppable: true,
  backgroundTransition: 'fade',
  slideNumber: false
}

export const initialState: NoteDetails = {
  markdownContent: '',
  rawFrontmatter: '',
  frontmatterRendererInfo: {
    frontmatterInvalid: false,
    deprecatedSyntax: false,
    lineOffset: 0,
    slideOptions: initialSlideOptions
  },
  id: '',
  createTime: DateTime.fromSeconds(0),
  lastChange: {
    timestamp: DateTime.fromSeconds(0),
    userName: ''
  },
  alias: '',
  viewCount: 0,
  authorship: [],
  noteTitle: '',
  firstHeading: '',
  frontmatter: {
    title: '',
    description: '',
    tags: [],
    deprecatedTagsSyntax: false,
    robots: '',
    lang: 'en',
    dir: NoteTextDirection.LTR,
    breaks: true,
    GA: '',
    disqus: '',
    type: NoteType.DOCUMENT,
    opengraph: new Map<string, string>(),
    slideOptions: initialSlideOptions
  }
}
