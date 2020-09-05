import React, { ReactElement } from 'react'
import { DomElement } from 'domhandler'
import { ComponentReplacer } from '../ComponentReplacer'

export class TaskListReplacer extends ComponentReplacer {
  onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void

  constructor (onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void) {
    super()
    this.onTaskCheckedChange = onTaskCheckedChange
  }

  handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const lineNum = Number(event.currentTarget.dataset.line)
    this.onTaskCheckedChange(lineNum, event.currentTarget.checked)
  }

  public getReplacement (node: DomElement): (ReactElement|undefined) {
    if (node.attribs?.class === 'task-list-item-checkbox') {
      return (
        <input
          className="task-list-item-checkbox"
          type="checkbox"
          checked={node.attribs.checked !== undefined}
          onChange={this.handleCheckboxChange}
          data-line={node.attribs['data-line']}
        />
      )
    }
  }
}
