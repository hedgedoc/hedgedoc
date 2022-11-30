/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppExtension } from '../../base/app-extension'
import { SetCheckboxInEditor } from './set-checkbox-in-editor'
import { TaskListMarkdownExtension } from './task-list-markdown-extension'
import type EventEmitter2 from 'eventemitter2'
import type React from 'react'

/**
 * Adds support for interactive checkbox lists to the markdown renderer.
 */
export class TaskListCheckboxAppExtension extends AppExtension {
  public static readonly EVENT_NAME = 'TaskListCheckbox'

  buildMarkdownRendererExtensions(eventEmitter: EventEmitter2): TaskListMarkdownExtension[] {
    return [new TaskListMarkdownExtension(eventEmitter)]
  }

  buildEditorExtensionComponent(): React.FC {
    return SetCheckboxInEditor
  }
}
