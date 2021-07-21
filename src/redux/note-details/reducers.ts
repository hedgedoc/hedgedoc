/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import { Reducer } from 'redux'
import {
  NoteFrontmatter,
  NoteTextDirection,
  NoteType
} from '../../components/editor-page/note-frontmatter/note-frontmatter'
import { NoteDetails, NoteDetailsActions, NoteDetailsActionType } from './types'
import { noteDtoToNoteDetails } from '../../api/notes/dto-methods'

export const initialState: NoteDetails = {
  markdownContent: '',
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

export const NoteDetailsReducer: Reducer<NoteDetails, NoteDetailsActions> = (
  state: NoteDetails = initialState,
  action: NoteDetailsActions
) => {
  switch (action.type) {
    case NoteDetailsActionType.SET_DOCUMENT_CONTENT:
      return {
        ...state,
        markdownContent: action.content
      }
    case NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING:
      return {
        ...state,
        firstHeading: action.firstHeading,
        noteTitle: generateNoteTitle(state.frontmatter, action.firstHeading)
      }
    case NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER:
      return noteDtoToNoteDetails(action.note)
    case NoteDetailsActionType.SET_NOTE_FRONTMATTER:
      return {
        ...state,
        frontmatter: action.frontmatter,
        noteTitle: generateNoteTitle(action.frontmatter, state.firstHeading)
      }
    case NoteDetailsActionType.SET_CHECKBOX_IN_MARKDOWN_CONTENT:
      return {
        ...state,
        markdownContent: setCheckboxInMarkdownContent(state.markdownContent, action.lineInMarkdown, action.checked)
      }
    default:
      return state
  }
}

const TASK_REGEX = /(\s*(?:[-*+]|\d+[.)]) )(\[[ xX]])( .*)/
const setCheckboxInMarkdownContent = (markdownContent: string, lineInMarkdown: number, checked: boolean): string => {
  const lines = markdownContent.split('\n')
  const results = TASK_REGEX.exec(lines[lineInMarkdown])
  if (results) {
    const before = results[1]
    const after = results[3]
    lines[lineInMarkdown] = `${before}[${checked ? 'x' : ' '}]${after}`
    return lines.join('\n')
  }
  return markdownContent
}

const generateNoteTitle = (frontmatter: NoteFrontmatter, firstHeading?: string) => {
  if (frontmatter?.title && frontmatter?.title !== '') {
    return frontmatter.title.trim()
  } else if (
    frontmatter?.opengraph &&
    frontmatter?.opengraph.get('title') &&
    frontmatter?.opengraph.get('title') !== ''
  ) {
    return (frontmatter?.opengraph.get('title') ?? firstHeading ?? '').trim()
  } else {
    return (firstHeading ?? firstHeading ?? '').trim()
  }
}
