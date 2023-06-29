/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtensionComponentProps } from '../../../components/cheatsheet/cheatsheet-extension'
import { useExtensionEventEmitterHandler } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import { createCheckboxContent } from './create-checkbox-content'
import type { TaskCheckedEventPayload } from './event-emitting-task-list-checkbox'
import { findCheckBox } from './find-check-box'
import { TaskListCheckboxAppExtension } from './task-list-checkbox-app-extension'
import type React from 'react'
import { useCallback } from 'react'

/**
 * Receives task-checkbox-change events and modify the current editor content.
 */
export const SetCheckboxInCheatsheet: React.FC<CheatsheetExtensionComponentProps> = ({ setContent }) => {
  useExtensionEventEmitterHandler(
    TaskListCheckboxAppExtension.EVENT_NAME,
    useCallback(
      (event: TaskCheckedEventPayload) => {
        setContent((previousContent) =>
          findCheckBox(previousContent, event.lineInMarkdown)
            .map(
              ([startIndex, endIndex]) =>
                previousContent.slice(0, startIndex) +
                createCheckboxContent(event.newCheckedState) +
                previousContent.slice(endIndex)
            )
            .orElse(previousContent)
        )
      },
      [setContent]
    )
  )
  return null
}
