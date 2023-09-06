/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useChangeEditorContentCallback } from '../../../components/editor-page/change-content-context/use-change-editor-content-callback'
import type { ContentEdits } from '../../../components/editor-page/editor-pane/tool-bar/formatters/types/changes'
import { useExtensionEventEmitterHandler } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import { store } from '../../../redux'
import { createCheckboxContent } from './create-checkbox-content'
import type { TaskCheckedEventPayload } from './event-emitting-task-list-checkbox'
import { findCheckBox } from './find-check-box'
import { TaskListCheckboxAppExtension } from './task-list-checkbox-app-extension'
import type React from 'react'
import { useCallback } from 'react'

/**
 * Receives task-checkbox-change events and modify the current editor content.
 */
export const SetCheckboxInEditor: React.FC = () => {
  const changeCallback = useSetCheckboxInEditor()
  useExtensionEventEmitterHandler(TaskListCheckboxAppExtension.EVENT_NAME, changeCallback)
  return null
}

/**
 * Provides a callback that changes the state of a checkbox in a given line in the current codemirror instance.
 */
export const useSetCheckboxInEditor = () => {
  const changeEditorContent = useChangeEditorContentCallback()

  return useCallback(
    ({ lineInMarkdown, newCheckedState }: TaskCheckedEventPayload): void => {
      const noteDetails = store.getState().noteDetails
      if (!noteDetails) {
        return
      }

      changeEditorContent?.(({ markdownContent }) => {
        const correctedLineIndex = lineInMarkdown + noteDetails.startOfContentLineOffset
        const edits = findCheckBox(markdownContent, correctedLineIndex)
          .map(([startIndex, endIndex]) => createCheckboxContentEdit(startIndex, endIndex, newCheckedState))
          .orElse([])
        return [edits, undefined]
      })
    },
    [changeEditorContent]
  )
}

/**
 * Creates a {@link ContentEdits content edit} for the change of a checkbox at a given position.
 *
 * @param checkboxStartIndex The start index of the old checkbox code
 * @param checkboxEndIndex The end index of the old checkbox code
 * @param newCheckboxState The new status of the checkbox
 * @return the created {@link ContentEdits edit}
 */
const createCheckboxContentEdit = (
  checkboxStartIndex: number,
  checkboxEndIndex: number,
  newCheckboxState: boolean
): ContentEdits => {
  return [
    {
      from: checkboxStartIndex,
      to: checkboxEndIndex,
      insert: createCheckboxContent(newCheckboxState)
    }
  ]
}
