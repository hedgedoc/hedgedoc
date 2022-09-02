/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import type { TaskCheckedChangeHandler, TaskListProps } from './task-list-checkbox'
import { TaskListCheckbox } from './task-list-checkbox'
import { useExtensionEventEmitter } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import { TaskListCheckboxAppExtension } from './task-list-checkbox-app-extension'

type EventEmittingTaskListCheckboxProps = Omit<TaskListProps, 'onTaskCheckedChange' | 'disabled'>

export interface TaskCheckedEventPayload {
  lineInMarkdown: number
  checked: boolean
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
      emitter?.emit(TaskListCheckboxAppExtension.EVENT_NAME, { lineInMarkdown, checked } as TaskCheckedEventPayload)
    },
    [emitter]
  )

  return <TaskListCheckbox onTaskCheckedChange={sendEvent} disabled={emitter === undefined} {...props} />
}
