/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'

export interface TaskListProps {
  onTaskCheckedChange?: (lineInMarkdown: number, checked: boolean) => void
  checked: boolean
  lineInMarkdown?: number
}

/**
 * Renders a task list checkbox.
 *
 * @param onTaskCheckedChange A callback that is executed if the checkbox was clicked. If this prop is omitted then the checkbox will be disabled.
 * @param checked Determines if the checkbox should be rendered as checked
 * @param lineInMarkdown Defines the line in the markdown code this checkbox is mapped to. The information is send with the onTaskCheckedChange callback.
 */
export const TaskListCheckbox: React.FC<TaskListProps> = ({ onTaskCheckedChange, checked, lineInMarkdown }) => {
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (onTaskCheckedChange && lineInMarkdown !== undefined) {
        onTaskCheckedChange(lineInMarkdown, event.currentTarget.checked)
      }
    },
    [lineInMarkdown, onTaskCheckedChange]
  )

  return (
    <input
      disabled={onTaskCheckedChange === undefined}
      className='task-list-item-checkbox'
      type='checkbox'
      checked={checked}
      onChange={onChange}
    />
  )
}
