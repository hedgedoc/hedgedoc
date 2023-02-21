/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtensionComponentProps } from '../../../components/editor-page/cheatsheet/cheatsheet-extension'
import { useExtensionEventEmitterHandler } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import { createCheckboxContent } from './create-checkbox-content'
import type { TaskCheckedEventPayload } from './event-emitting-task-list-checkbox'
import { findCheckBox } from './find-check-box'
import { TaskListCheckboxAppExtension } from './task-list-checkbox-app-extension'
import type React from 'react'

/**
 * Receives task-checkbox-change events and modify the current editor content.
 */
export const SetCheckboxInCheatsheet: React.FC<CheatsheetExtensionComponentProps> = ({ setContent }) => {
  useExtensionEventEmitterHandler(TaskListCheckboxAppExtension.EVENT_NAME, (event: TaskCheckedEventPayload) => {
    setContent((previousContent) => {
      return findCheckBox(previousContent, event.lineInMarkdown)
        .map(
          ([startIndex, endIndex]) =>
            previousContent.slice(0, startIndex) +
            createCheckboxContent(event.newCheckedState) +
            previousContent.slice(endIndex)
        )
        .orElse(previousContent)
    })
  })
  return null
}
