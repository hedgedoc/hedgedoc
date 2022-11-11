/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useEffect, useMemo } from 'react'
import { WaitSpinner } from '../../../common/wait-spinner/wait-spinner'
import { eventEmitterContext } from '../../../markdown-renderer/hooks/use-extension-event-emitter'
import EventEmitter2 from 'eventemitter2'
import type { TaskCheckedEventPayload } from '../../../../extensions/extra-integrations/task-list/event-emitting-task-list-checkbox'
import { TaskListCheckboxAppExtension } from '../../../../extensions/extra-integrations/task-list/task-list-checkbox-app-extension'

export interface CheatsheetLineProps {
  markdown: string
  onTaskCheckedChange: (newValue: boolean) => void
}

const HighlightedCode = React.lazy(
  () => import('../../../../extensions/extra-integrations/highlighted-code-fence/highlighted-code')
)
const DocumentMarkdownRenderer = React.lazy(() => import('../../../markdown-renderer/document-markdown-renderer'))

/**
 * Renders one line in the {@link CheatsheetTabContent cheat sheet}.
 * This line shows an minimal markdown example and how it would be rendered.
 *
 * @param markdown The markdown to be shown and rendered
 * @param onTaskCheckedChange A callback to call if a task would be clicked
 */
export const CheatsheetLine: React.FC<CheatsheetLineProps> = ({ markdown, onTaskCheckedChange }) => {
  const lines = useMemo(() => markdown.split('\n'), [markdown])
  const eventEmitter = useMemo(() => new EventEmitter2(), [])

  useEffect(() => {
    const handler = ({ checked }: TaskCheckedEventPayload) => onTaskCheckedChange(checked)
    eventEmitter.on(TaskListCheckboxAppExtension.EVENT_NAME, handler)
    return () => {
      eventEmitter.off(TaskListCheckboxAppExtension.EVENT_NAME, handler)
    }
  })

  return (
    <Suspense
      fallback={
        <tr>
          <td colSpan={2}>
            <WaitSpinner />
          </td>
        </tr>
      }>
      <tr>
        <td>
          <eventEmitterContext.Provider value={eventEmitter}>
            <DocumentMarkdownRenderer markdownContentLines={lines} baseUrl={'https://example.org'} />
          </eventEmitterContext.Provider>
        </td>
        <td className={'markdown-body'}>
          <HighlightedCode code={markdown} wrapLines={true} startLineNumber={1} language={'markdown'} />
        </td>
      </tr>
    </Suspense>
  )
}
