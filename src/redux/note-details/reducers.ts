/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import { Reducer } from 'redux'
import { Note } from '../../api/notes'
import { NoteFrontmatter } from '../../components/editor-page/note-frontmatter/note-frontmatter'
import {
  NoteDetails,
  NoteDetailsAction,
  NoteDetailsActionType,
  SetCheckboxInMarkdownContentAction,
  SetNoteDetailsAction,
  SetNoteDetailsFromServerAction,
  SetNoteFrontmatterFromRenderingAction,
  UpdateNoteTitleByFirstHeadingAction
} from './types'

export const initialState: NoteDetails = {
  markdownContent: '',
  id: '',
  createTime: DateTime.fromSeconds(0),
  lastChange: {
    timestamp: DateTime.fromSeconds(0),
    userId: ''
  },
  alias: '',
  preVersionTwoNote: false,
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
    dir: 'ltr',
    breaks: true,
    GA: '',
    disqus: '',
    type: '',
    opengraph: new Map<string, string>()
  }
}

export const NoteDetailsReducer: Reducer<NoteDetails, NoteDetailsAction> = (state: NoteDetails = initialState, action: NoteDetailsAction) => {
  switch (action.type) {
    case NoteDetailsActionType.SET_DOCUMENT_CONTENT:
      return {
        ...state,
        markdownContent: (action as SetNoteDetailsAction).content
      }
    case NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING:
      return {
        ...state,
        firstHeading: (action as UpdateNoteTitleByFirstHeadingAction).firstHeading,
        noteTitle: generateNoteTitle(state.frontmatter, (action as UpdateNoteTitleByFirstHeadingAction).firstHeading)
      }
    case NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER:
      return convertNoteToNoteDetails((action as SetNoteDetailsFromServerAction).note)
    case NoteDetailsActionType.SET_NOTE_FRONTMATTER:
      return {
        ...state,
        frontmatter: (action as SetNoteFrontmatterFromRenderingAction).frontmatter,
        noteTitle: generateNoteTitle((action as SetNoteFrontmatterFromRenderingAction).frontmatter, state.firstHeading)
      }
    case NoteDetailsActionType.SET_CHECKBOX_IN_MARKDOWN_CONTENT:
      return {
        ...state,
        markdownContent: setCheckboxInMarkdownContent(
          state.markdownContent,
          (action as SetCheckboxInMarkdownContentAction).lineInMarkdown,
          (action as SetCheckboxInMarkdownContentAction).checked
        )
      }
    default:
      return state
  }
}

const TASK_REGEX = /(\s*[-*] )(\[[ xX]])( .*)/
const setCheckboxInMarkdownContent = (markdownContent: string, lineInMarkdown: number, checked: boolean): string => {
  const lines = markdownContent.split('\n')
  const results = TASK_REGEX.exec(lines[lineInMarkdown])
  if (results) {
    const before = results[1]
    const after = results[3]
    lines[lineInMarkdown] = `${ before }[${ checked ? 'x' : ' ' }]${ after }`
    return lines.join('\n')
  }
  return markdownContent
}

const generateNoteTitle = (frontmatter: NoteFrontmatter, firstHeading?: string) => {
  if (frontmatter?.title && frontmatter?.title !== '') {
    return frontmatter.title.trim()
  } else if (frontmatter?.opengraph && frontmatter?.opengraph.get('title') && frontmatter?.opengraph.get('title') !== '') {
    return (frontmatter?.opengraph.get('title') ?? firstHeading ?? '').trim()
  } else {
    return (firstHeading ?? firstHeading ?? '').trim()
  }
}

const convertNoteToNoteDetails = (note: Note): NoteDetails => {
  return {
    markdownContent: note.content,
    frontmatter: initialState.frontmatter,
    id: note.id,
    noteTitle: initialState.noteTitle,
    createTime: DateTime.fromSeconds(note.createTime),
    lastChange: {
      userId: note.lastChange.userId,
      timestamp: DateTime.fromSeconds(note.lastChange.timestamp)
    },
    firstHeading: initialState.firstHeading,
    preVersionTwoNote: note.preVersionTwoNote,
    viewCount: note.viewCount,
    alias: note.alias,
    authorship: note.authorship
  }
}
