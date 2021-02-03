/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'
import React, { ReactElement } from 'react'
import { ComponentReplacer } from '../ComponentReplacer'

export class TaskListReplacer extends ComponentReplacer {
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void

  constructor(onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void) {
    super()
    this.onTaskCheckedChange = onTaskCheckedChange
  }

  handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const lineNum = Number(event.currentTarget.dataset.line)
    if (this.onTaskCheckedChange) {
      this.onTaskCheckedChange(lineNum, event.currentTarget.checked)
    }
  }

  public getReplacement(node: DomElement): (ReactElement | undefined) {
    if (node.attribs?.class !== 'task-list-item-checkbox') {
      return
    }
    return (
      <input
        disabled={ this.onTaskCheckedChange === undefined }
        className="task-list-item-checkbox"
        type="checkbox"
        checked={ node.attribs.checked !== undefined }
        onChange={ this.handleCheckboxChange }
        id={ node.attribs.id }
        data-line={ node.attribs['data-line'] }
      />
    )
  }
}
