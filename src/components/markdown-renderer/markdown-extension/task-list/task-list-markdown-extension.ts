/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import type MarkdownIt from 'markdown-it'
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import type { TaskCheckedChangeHandler } from './task-list-replacer'
import { TaskListReplacer } from './task-list-replacer'
import markdownItTaskLists from '@hedgedoc/markdown-it-task-lists'

/**
 * Adds support for interactive checkbox lists to the markdown rendering using the github checklist syntax.
 */
export class TaskListMarkdownExtension extends MarkdownExtension {
  constructor(private onTaskCheckedChange?: TaskCheckedChangeHandler) {
    super()
  }

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownItTaskLists(markdownIt, {
      enabled: true,
      label: true,
      lineNumber: true
    })
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new TaskListReplacer(this.onTaskCheckedChange)]
  }
}
