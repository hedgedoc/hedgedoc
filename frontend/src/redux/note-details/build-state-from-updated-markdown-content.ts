/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { calculateLineStartIndexes } from './calculate-line-start-indexes'
import { initialState } from './initial-state'
import type { NoteDetails } from './types'
import type { FrontmatterExtractionResult, NoteFrontmatter } from '@hedgedoc/commons'
import {
  convertRawFrontmatterToNoteFrontmatter,
  extractFrontmatter,
  generateNoteTitle,
  parseRawFrontmatterFromYaml
} from '@hedgedoc/commons'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Copies a {@link NoteDetails} but with another markdown content.
 * @param state The previous state.
 * @param markdownContent The new note markdown content consisting of the frontmatter and markdown part.
 * @return An updated {@link NoteDetails} state.
 */
export const buildStateFromUpdatedMarkdownContent = (state: NoteDetails, markdownContent: string): NoteDetails => {
  return buildStateFromMarkdownContentAndLines(state, markdownContent, markdownContent.split('\n'))
}

/**
 * Copies a {@link NoteDetails} but with another markdown content.
 * @param state The previous state.
 * @param markdownContentLines The new note markdown content as separate lines consisting of the frontmatter and markdown part.
 * @return An updated {@link NoteDetails} state.
 */
export const buildStateFromUpdatedMarkdownContentLines = (
  state: NoteDetails,
  markdownContentLines: string[]
): NoteDetails => {
  return buildStateFromMarkdownContentAndLines(state, markdownContentLines.join('\n'), markdownContentLines)
}

const buildStateFromMarkdownContentAndLines = (
  state: NoteDetails,
  markdownContent: string,
  markdownContentLines: string[]
): NoteDetails => {
  const frontmatterExtraction = extractFrontmatter(markdownContentLines)
  const lineStartIndexes = calculateLineStartIndexes(markdownContentLines)
  if (frontmatterExtraction !== undefined) {
    return buildStateFromFrontmatterUpdate(
      {
        ...state,
        markdownContent: {
          plain: markdownContent,
          lines: markdownContentLines,
          lineStartIndexes
        }
      },
      frontmatterExtraction
    )
  } else {
    return {
      ...state,
      markdownContent: {
        plain: markdownContent,
        lines: markdownContentLines,
        lineStartIndexes
      },
      startOfContentLineOffset: 0,
      rawFrontmatter: '',
      title: generateNoteTitle(initialState.frontmatter, () => state.firstHeading),
      frontmatter: initialState.frontmatter
    }
  }
}

/**
 * Builds a {@link NoteDetails} redux state from extracted frontmatter data.
 * @param state The previous redux state.
 * @param frontmatterExtraction The result of the frontmatter extraction containing the raw data and the line offset.
 * @return An updated {@link NoteDetails} redux state.
 */
const buildStateFromFrontmatterUpdate = (
  state: NoteDetails,
  frontmatterExtraction: FrontmatterExtractionResult
): NoteDetails => {
  if (frontmatterExtraction.incomplete) {
    frontmatterExtraction.rawText = state.rawFrontmatter
    return buildStateFromFrontmatter(state, parseFrontmatter(frontmatterExtraction), frontmatterExtraction)
  }
  if (frontmatterExtraction.rawText === state.rawFrontmatter) {
    return state
  }
  return buildStateFromFrontmatter(state, parseFrontmatter(frontmatterExtraction), frontmatterExtraction)
}

const parseFrontmatter = (frontmatterExtraction: FrontmatterExtractionResult) => {
  return Optional.of(parseRawFrontmatterFromYaml(frontmatterExtraction.rawText))
    .filter((frontmatter) => frontmatter.error === undefined)
    .map((frontmatter) => frontmatter.value)
    .map((value) => convertRawFrontmatterToNoteFrontmatter(value))
    .orElse(initialState.frontmatter)
}

const buildStateFromFrontmatter = (
  state: NoteDetails,
  noteFrontmatter: NoteFrontmatter,
  frontmatterExtraction: FrontmatterExtractionResult
) => {
  return {
    ...state,
    title: generateNoteTitle(noteFrontmatter, () => state.firstHeading),
    rawFrontmatter: frontmatterExtraction.rawText,
    frontmatter: noteFrontmatter,
    startOfContentLineOffset: frontmatterExtraction.lineOffset
  }
}
