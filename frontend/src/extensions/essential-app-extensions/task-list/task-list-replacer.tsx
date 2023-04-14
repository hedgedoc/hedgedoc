/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { EventEmittingTaskListCheckbox } from './event-emitting-task-list-checkbox'
import type { Element } from 'domhandler'
import React from 'react'

/**
 * Detects task lists and renders them as checkboxes that execute a callback if clicked.
 */
export class TaskListReplacer extends ComponentReplacer {
  public replace(node: Element): NodeReplacement {
    if (node.attribs?.class !== 'task-list-item-checkbox') {
      return DO_NOT_REPLACE
    }
    const lineInMarkdown = Number(node.attribs['data-line'])
    return isNaN(lineInMarkdown) ? (
      DO_NOT_REPLACE
    ) : (
      <EventEmittingTaskListCheckbox checked={node.attribs.checked !== undefined} lineInMarkdown={lineInMarkdown} />
    )
  }
}
