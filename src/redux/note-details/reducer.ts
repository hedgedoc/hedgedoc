/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { PresentFrontmatterExtractionResult } from '../../components/common/note-frontmatter/types'
import {
  createNoteFrontmatterFromYaml,
  NoteFrontmatter
} from '../../components/common/note-frontmatter/note-frontmatter'
import { NoteDetails, NoteDetailsActions, NoteDetailsActionType } from './types'
import { extractFrontmatter } from '../../components/common/note-frontmatter/extract-frontmatter'
import { NoteDto } from '../../api/notes/types'
import { initialState } from './initial-state'
import { DateTime } from 'luxon'

export const NoteDetailsReducer: Reducer<NoteDetails, NoteDetailsActions> = (
  state: NoteDetails = initialState,
  action: NoteDetailsActions
) => {
  switch (action.type) {
    case NoteDetailsActionType.SET_DOCUMENT_CONTENT:
      return buildStateFromMarkdownContentUpdate(state, action.content)
    case NoteDetailsActionType.UPDATE_NOTE_TITLE_BY_FIRST_HEADING:
      return buildStateFromFirstHeadingUpdate(state, action.firstHeading)
    case NoteDetailsActionType.SET_NOTE_DATA_FROM_SERVER:
      return buildStateFromServerDto(action.dto)
    case NoteDetailsActionType.UPDATE_TASK_LIST_CHECKBOX:
      return buildStateFromTaskListUpdate(state, action.changedLine, action.checkboxChecked)
    default:
      return state
  }
}

/**
 * Builds a {@link NoteDetails} redux state from a DTO received as an API response.
 * @param dto The first DTO received from the API containing the relevant information about the note.
 * @return An updated {@link NoteDetails} redux state.
 */
const buildStateFromServerDto = (dto: NoteDto): NoteDetails => {
  const newState = convertNoteDtoToNoteDetails(dto)
  return buildStateFromMarkdownContentUpdate(newState, newState.markdownContent)
}

const TASK_REGEX = /(\s*(?:[-*+]|\d+[.)]) )(\[[ xX]])( .*)/
/**
 * Builds a {@link NoteDetails} redux state where a checkbox in the markdown content either gets checked or unchecked.
 * @param state The previous redux state.
 * @param changedLine The number of the line in which the checkbox should be updated.
 * @param checkboxChecked true if the checkbox should be checked, false otherwise.
 * @return An updated {@link NoteDetails} redux state.
 */
const buildStateFromTaskListUpdate = (
  state: NoteDetails,
  changedLine: number,
  checkboxChecked: boolean
): NoteDetails => {
  const lines = state.markdownContent.split('\n')
  const results = TASK_REGEX.exec(lines[changedLine])
  if (results) {
    const before = results[1]
    const after = results[3]
    lines[changedLine] = `${before}[${checkboxChecked ? 'x' : ' '}]${after}`
    return buildStateFromMarkdownContentUpdate(state, lines.join('\n'))
  }
  return state
}

/**
 * Builds a {@link NoteDetails} redux state from a fresh document content.
 * @param state The previous redux state.
 * @param markdownContent The fresh document content consisting of the frontmatter and markdown part.
 * @return An updated {@link NoteDetails} redux state.
 */
const buildStateFromMarkdownContentUpdate = (state: NoteDetails, markdownContent: string): NoteDetails => {
  const frontmatterExtraction = extractFrontmatter(markdownContent)
  if (!frontmatterExtraction.isPresent) {
    return {
      ...state,
      markdownContent: markdownContent,
      rawFrontmatter: '',
      noteTitle: generateNoteTitle(initialState.frontmatter, state.firstHeading),
      frontmatter: initialState.frontmatter,
      frontmatterRendererInfo: initialState.frontmatterRendererInfo
    }
  }
  return buildStateFromFrontmatterUpdate(
    {
      ...state,
      markdownContent: markdownContent
    },
    frontmatterExtraction
  )
}

/**
 * Builds a {@link NoteDetails} redux state from extracted frontmatter data.
 * @param state The previous redux state.
 * @param frontmatterExtraction The result of the frontmatter extraction containing the raw data and the line offset.
 * @return An updated {@link NoteDetails} redux state.
 */
const buildStateFromFrontmatterUpdate = (
  state: NoteDetails,
  frontmatterExtraction: PresentFrontmatterExtractionResult
): NoteDetails => {
  if (frontmatterExtraction.rawText === state.rawFrontmatter) {
    return state
  }
  try {
    const frontmatter = createNoteFrontmatterFromYaml(frontmatterExtraction.rawText)
    return {
      ...state,
      rawFrontmatter: frontmatterExtraction.rawText,
      frontmatter: frontmatter,
      noteTitle: generateNoteTitle(frontmatter, state.firstHeading),
      frontmatterRendererInfo: {
        lineOffset: frontmatterExtraction.lineOffset,
        deprecatedSyntax: frontmatter.deprecatedTagsSyntax,
        frontmatterInvalid: false,
        slideOptions: frontmatter.slideOptions
      }
    }
  } catch (e) {
    return {
      ...state,
      noteTitle: generateNoteTitle(initialState.frontmatter, state.firstHeading),
      rawFrontmatter: frontmatterExtraction.rawText,
      frontmatter: initialState.frontmatter,
      frontmatterRendererInfo: {
        lineOffset: frontmatterExtraction.lineOffset,
        deprecatedSyntax: false,
        frontmatterInvalid: true,
        slideOptions: initialState.frontmatterRendererInfo.slideOptions
      }
    }
  }
}

/**
 * Builds a {@link NoteDetails} redux state with an updated note title from frontmatter data and the first heading.
 * @param state The previous redux state.
 * @param firstHeading The first heading of the document. Should be {@code undefined} if there is no such heading.
 * @return An updated {@link NoteDetails} redux state.
 */
const buildStateFromFirstHeadingUpdate = (state: NoteDetails, firstHeading?: string): NoteDetails => {
  return {
    ...state,
    firstHeading: firstHeading,
    noteTitle: generateNoteTitle(state.frontmatter, firstHeading)
  }
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
    return (firstHeading ?? '').trim()
  }
}

/**
 * Converts a note DTO from the HTTP API to a {@link NoteDetails} object.
 * Note that the documentContent will be set but the markdownContent and rawFrontmatterContent are yet to be processed.
 * @param note The NoteDTO as defined in the backend.
 * @return The NoteDetails object corresponding to the DTO.
 */
const convertNoteDtoToNoteDetails = (note: NoteDto): NoteDetails => {
  return {
    markdownContent: note.content,
    rawFrontmatter: '',
    frontmatterRendererInfo: initialState.frontmatterRendererInfo,
    frontmatter: initialState.frontmatter,
    id: note.metadata.id,
    noteTitle: initialState.noteTitle,
    createTime: DateTime.fromISO(note.metadata.createTime),
    lastChange: {
      userName: note.metadata.updateUser.userName,
      timestamp: DateTime.fromISO(note.metadata.updateTime)
    },
    firstHeading: initialState.firstHeading,
    viewCount: note.metadata.viewCount,
    alias: note.metadata.alias,
    authorship: note.metadata.editedBy
  }
}
