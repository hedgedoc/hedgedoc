/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import type { ReactElement } from 'react'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'

export type TaskCheckedChangeHandler = (lineInMarkdown: number, checked: boolean) => void

/**
 * Detects task lists and renders them as checkboxes that execute a callback if clicked.
 */
export class TaskListReplacer extends ComponentReplacer {
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  private readonly frontmatterLinesOffset

  constructor(onTaskCheckedChange?: TaskCheckedChangeHandler, frontmatterLinesOffset?: number) {
    super()
    this.onTaskCheckedChange = onTaskCheckedChange
    this.frontmatterLinesOffset = frontmatterLinesOffset ?? 0
  }

  handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const lineNum = Number(event.currentTarget.dataset.line)
    if (this.onTaskCheckedChange) {
      this.onTaskCheckedChange(lineNum + this.frontmatterLinesOffset, event.currentTarget.checked)
    }
  }

  public getReplacement(node: Element): ReactElement | undefined {
    if (node.attribs?.class !== 'task-list-item-checkbox') {
      return
    }
    return (
      <input
        disabled={this.onTaskCheckedChange === undefined}
        className='task-list-item-checkbox'
        type='checkbox'
        checked={node.attribs.checked !== undefined}
        onChange={this.handleCheckboxChange}
        id={node.attribs.id}
        data-line={node.attribs['data-line']}
      />
    )
  }
}
