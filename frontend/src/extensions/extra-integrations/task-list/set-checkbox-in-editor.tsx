/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useExtensionEventEmitterHandler } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import { TaskListCheckboxAppExtension } from './task-list-checkbox-app-extension'
import { useSetCheckboxInEditor } from './use-set-checkbox-in-editor'
import type React from 'react'

/**
 * Receives task-checkbox-change events and modify the current editor content.
 */
export const SetCheckboxInEditor: React.FC = () => {
  const changeCallback = useSetCheckboxInEditor()
  useExtensionEventEmitterHandler(TaskListCheckboxAppExtension.EVENT_NAME, changeCallback)
  return null
}
