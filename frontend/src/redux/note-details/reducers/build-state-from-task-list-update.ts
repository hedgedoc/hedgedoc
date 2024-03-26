/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildStateFromUpdatedMarkdownContentLines } from '../build-state-from-updated-markdown-content'
import type { NoteDetails } from '../types'
import { Optional } from '@mrdrogdrog/optional'

const TASK_REGEX = /(\s*(?:[-*+]|\d+[.)]) )\[[ xX]?]( .*)/
/**
 * Builds a {@link NoteDetails} redux state where a checkbox in the markdown content either gets checked or unchecked.
 * @param state The previous redux state.
 * @param changedLineIndex The number of the line in which the checkbox should be updated.
 * @param checkboxChecked true if the checkbox should be checked, false otherwise.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromTaskListUpdate = (
  state: NoteDetails,
  changedLineIndex: number,
  checkboxChecked: boolean
): NoteDetails => {
  const lines = [...state.markdownContent.lines]
  return Optional.ofNullable(TASK_REGEX.exec(lines[changedLineIndex]))
    .map((results) => {
      const [, beforeCheckbox, afterCheckbox] = results
      lines[changedLineIndex] = `${beforeCheckbox}[${checkboxChecked ? 'x' : ' '}]${afterCheckbox}`
      return buildStateFromUpdatedMarkdownContentLines(state, lines)
    })
    .orElse(state)
}
