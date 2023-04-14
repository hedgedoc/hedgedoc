/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/event-markdown-renderer-extension'
import type { ComponentReplacer } from '../../../components/markdown-renderer/replace-components/component-replacer'
import { TaskListReplacer } from './task-list-replacer'
import { taskLists } from '@hedgedoc/markdown-it-plugins'
import type MarkdownIt from 'markdown-it'

/**
 * Adds support for interactive checkbox lists to the markdown rendering using the github checklist syntax.
 */
export class TaskListMarkdownExtension extends EventMarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    taskLists(markdownIt, {
      enabled: true,
      label: true,
      lineNumber: true
    })
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new TaskListReplacer()]
  }
}
