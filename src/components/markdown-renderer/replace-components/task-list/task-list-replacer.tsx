import React, { ReactElement } from 'react'
import { DomElement } from 'domhandler'
import { ComponentReplacer, SubNodeConverter } from '../ComponentReplacer'

export class TaskListReplacer implements ComponentReplacer {
  onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void

  constructor (onTaskCheckedChange: (lineInMarkdown: number, checked: boolean) => void) {
    this.onTaskCheckedChange = onTaskCheckedChange
  }

  handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const lineNum = Number(event.currentTarget.dataset.line)
    this.onTaskCheckedChange(lineNum, event.currentTarget.checked)
  }

  getReplacement (node: DomElement, index:number, subNodeConverter: SubNodeConverter): (ReactElement|undefined) {
    if (node.attribs?.class === 'task-list-item-checkbox') {
      return (
        <input
          className="task-list-item-checkbox"
          type="checkbox"
          checked={node.attribs.checked !== undefined}
          onChange={this.handleCheckboxChange}
          data-line={node.attribs['data-line']}
          key={`task-list-item-checkbox${node.attribs['data-line']}`}
        />
      )
    }
  }
}
