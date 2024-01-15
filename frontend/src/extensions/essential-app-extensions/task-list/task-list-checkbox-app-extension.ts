/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import type { MarkdownRendererExtensionOptions } from '../../_base-classes/app-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { SetCheckboxInCheatsheet } from './set-checkbox-in-cheatsheet'
import { SetCheckboxInEditor } from './set-checkbox-in-editor'
import { TaskListMarkdownExtension } from './task-list-markdown-extension'
import type React from 'react'

/**
 * Adds support for interactive checkbox lists to the markdown renderer.
 */
export class TaskListCheckboxAppExtension extends AppExtension {
  public static readonly EVENT_NAME = 'TaskListCheckbox'

  buildMarkdownRendererExtensions(options: MarkdownRendererExtensionOptions): TaskListMarkdownExtension[] {
    return [new TaskListMarkdownExtension(options.eventEmitter)]
  }

  buildEditorExtensionComponent(): React.FC {
    return SetCheckboxInEditor
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [{ i18nKey: 'taskList', categoryI18nKey: 'other', cheatsheetExtensionComponent: SetCheckboxInCheatsheet }]
  }
}
