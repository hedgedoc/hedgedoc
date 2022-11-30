/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react'

export type TaskCheckedChangeHandler = (lineInMarkdown: number, checked: boolean) => void

export interface TaskListProps {
  onTaskCheckedChange?: TaskCheckedChangeHandler
  checked: boolean
  lineInMarkdown?: number
  disabled?: boolean
}

/**
 * Renders a task list checkbox.
 *
 * @param onTaskCheckedChange A callback that is executed if the checkbox was clicked. If this prop is omitted then the checkbox will be disabled.
 * @param checked Determines if the checkbox should be rendered as checked
 * @param lineInMarkdown Defines the line in the markdown code this checkbox is mapped to. The information is send with the onTaskCheckedChange callback.
 */
export const TaskListCheckbox: React.FC<TaskListProps> = ({
  onTaskCheckedChange,
  checked,
  lineInMarkdown,
  disabled
}) => {
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (onTaskCheckedChange && disabled !== true && lineInMarkdown !== undefined) {
        onTaskCheckedChange(lineInMarkdown, event.currentTarget.checked)
      }
    },
    [disabled, lineInMarkdown, onTaskCheckedChange]
  )

  return (
    <input
      disabled={disabled !== true && onTaskCheckedChange === undefined}
      className='task-list-item-checkbox'
      type='checkbox'
      checked={checked}
      onChange={onChange}
    />
  )
}
