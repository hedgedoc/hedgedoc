/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import markdownItTaskLists from '@hedgedoc/markdown-it-task-lists'
import type MarkdownIt from 'markdown-it'

export const tasksLists: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItTaskLists(markdownIt, {
    enabled: true,
    label: true,
    lineNumber: true
  })
}
