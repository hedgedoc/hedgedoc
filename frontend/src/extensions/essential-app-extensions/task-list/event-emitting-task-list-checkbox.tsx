/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useExtensionEventEmitter } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import type { TaskCheckedChangeHandler, TaskListProps } from './task-list-checkbox'
import { TaskListCheckbox } from './task-list-checkbox'
import { TaskListCheckboxAppExtension } from './task-list-checkbox-app-extension'
import React, { useCallback } from 'react'

type EventEmittingTaskListCheckboxProps = Omit<TaskListProps, 'onTaskCheckedChange' | 'disabled'>

export interface TaskCheckedEventPayload {
  lineInMarkdown: number
  newCheckedState: boolean
}

/**
 * Wraps a {@link TaskListCheckbox} but sends state changes to the current {@link EventEmitter2 event emitter}.
 *
 * @param props Props that will be forwarded to the checkbox.
 */
export const EventEmittingTaskListCheckbox: React.FC<EventEmittingTaskListCheckboxProps> = (props) => {
  const emitter = useExtensionEventEmitter()
  const sendEvent: TaskCheckedChangeHandler = useCallback(
    (lineInMarkdown: number, checked: boolean) => {
      emitter?.emit(TaskListCheckboxAppExtension.EVENT_NAME, {
        lineInMarkdown,
        newCheckedState: checked
      } as TaskCheckedEventPayload)
    },
    [emitter]
  )

  return <TaskListCheckbox onTaskCheckedChange={sendEvent} disabled={emitter === undefined} {...props} />
}
