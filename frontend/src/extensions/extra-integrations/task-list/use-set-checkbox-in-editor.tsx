/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react'
import { Optional } from '@mrdrogdrog/optional'
import { useChangeEditorContentCallback } from '../../../components/editor-page/change-content-context/use-change-editor-content-callback'
import type { ContentEdits } from '../../../components/editor-page/editor-pane/tool-bar/formatters/types/changes'
import type { TaskCheckedEventPayload } from './event-emitting-task-list-checkbox'
import { store } from '../../../redux'

const TASK_REGEX = /(\s*(?:[-*+]|\d+[.)]) )(\[[ xX]?])/

/**
 * Provides a callback that changes the state of a checkbox in a given line in the current codemirror instance.
 */
export const useSetCheckboxInEditor = () => {
  const changeEditorContent = useChangeEditorContentCallback()

  return useCallback(
    ({ lineInMarkdown, checked }: TaskCheckedEventPayload): void => {
      changeEditorContent?.(({ markdownContent }) => {
        const lines = markdownContent.split('\n')
        const correctedLineIndex = lineInMarkdown + store.getState().noteDetails.frontmatterRendererInfo.lineOffset
        const lineStartIndex = findStartIndexOfLine(lines, correctedLineIndex)
        const edits = Optional.ofNullable(TASK_REGEX.exec(lines[correctedLineIndex]))
          .map(([, beforeCheckbox, oldCheckbox]) => {
            const checkboxStartIndex = lineStartIndex + beforeCheckbox.length
            return createCheckboxContentEdit(checkboxStartIndex, oldCheckbox, checked)
          })
          .orElse([])
        return [edits, undefined]
      })
    },
    [changeEditorContent]
  )
}

/**
 * Finds the start position of the wanted line index if the given lines would be concat with new-line-characters.
 *
 * @param lines The lines to search through
 * @param wantedLineIndex The index of the line whose start position should be found
 * @return the found start position
 */
const findStartIndexOfLine = (lines: string[], wantedLineIndex: number): number => {
  return lines
    .map((value) => value.length)
    .filter((value, index) => index < wantedLineIndex)
    .reduce((state, lineLength) => state + lineLength + 1, 0)
}

/**
 * Creates a {@link ContentEdits content edit} for the change of a checkbox at a given position.
 *
 * @param checkboxStartIndex The start index of the checkbox
 * @param oldCheckbox The old checkbox that should be replaced
 * @param newCheckboxState The new status of the checkbox
 * @return the created {@link ContentEdits edit}
 */
const createCheckboxContentEdit = (
  checkboxStartIndex: number,
  oldCheckbox: string,
  newCheckboxState: boolean
): ContentEdits => {
  return [
    {
      from: checkboxStartIndex,
      to: checkboxStartIndex + oldCheckbox.length,
      insert: `[${newCheckboxState ? 'x' : ' '}]`
    }
  ]
}
