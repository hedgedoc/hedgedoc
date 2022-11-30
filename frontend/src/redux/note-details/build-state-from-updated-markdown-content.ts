/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { calculateLineStartIndexes } from './calculate-line-start-indexes'
import { extractFrontmatter } from './frontmatter-extractor/extractor'
import type { PresentFrontmatterExtractionResult } from './frontmatter-extractor/types'
import { generateNoteTitle } from './generate-note-title'
import { initialState } from './initial-state'
import { createNoteFrontmatterFromYaml } from './raw-note-frontmatter-parser/parser'
import type { NoteDetails } from './types/note-details'

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
  if (frontmatterExtraction.isPresent) {
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
      rawFrontmatter: '',
      title: generateNoteTitle(initialState.frontmatter, state.firstHeading),
      frontmatter: initialState.frontmatter,
      frontmatterRendererInfo: initialState.frontmatterRendererInfo
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
      title: generateNoteTitle(frontmatter, state.firstHeading),
      frontmatterRendererInfo: {
        lineOffset: frontmatterExtraction.lineOffset,
        frontmatterInvalid: false,
        slideOptions: frontmatter.slideOptions
      }
    }
  } catch (e) {
    return {
      ...state,
      title: generateNoteTitle(initialState.frontmatter, state.firstHeading),
      rawFrontmatter: frontmatterExtraction.rawText,
      frontmatter: initialState.frontmatter,
      frontmatterRendererInfo: {
        lineOffset: frontmatterExtraction.lineOffset,
        frontmatterInvalid: true,
        slideOptions: initialState.frontmatterRendererInfo.slideOptions
      }
    }
  }
}
