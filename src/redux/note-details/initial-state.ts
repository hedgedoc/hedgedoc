/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NoteDetails } from './types'
import { DateTime } from 'luxon'
import { NoteTextDirection, NoteType } from '../../components/common/note-frontmatter/types'

export const initialState: NoteDetails = {
  documentContent: '',
  markdownContent: '',
  rawFrontmatter: '',
  frontmatterRendererInfo: {
    frontmatterInvalid: false,
    deprecatedSyntax: false,
    offsetLines: 0
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
    opengraph: new Map<string, string>()
  }
}
