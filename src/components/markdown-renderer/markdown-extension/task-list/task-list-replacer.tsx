/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import React from 'react'
import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import { TaskListCheckbox } from './task-list-checkbox'

export type TaskCheckedChangeHandler = (lineInMarkdown: number, checked: boolean) => void

/**
 * Detects task lists and renders them as checkboxes that execute a callback if clicked.
 */
export class TaskListReplacer extends ComponentReplacer {
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void

  constructor(onTaskCheckedChange?: TaskCheckedChangeHandler) {
    super()
    this.onTaskCheckedChange = (lineInMarkdown, checked) => onTaskCheckedChange?.(lineInMarkdown, checked)
  }

  public replace(node: Element): NodeReplacement {
    if (node.attribs?.class !== 'task-list-item-checkbox') {
      return DO_NOT_REPLACE
    }
    const lineInMarkdown = Number(node.attribs['data-line'])
    return isNaN(lineInMarkdown) ? (
      DO_NOT_REPLACE
    ) : (
      <TaskListCheckbox
        onTaskCheckedChange={this.onTaskCheckedChange}
        checked={node.attribs.checked !== undefined}
        lineInMarkdown={lineInMarkdown}
      />
    )
  }
}
