/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useCallback, useMemo } from 'react'
import { WaitSpinner } from '../../../common/wait-spinner/wait-spinner'

export interface CheatsheetLineProps {
  markdown: string
  onTaskCheckedChange: (newValue: boolean) => void
}

const HighlightedCode = React.lazy(
  () => import('../../../markdown-renderer/markdown-extension/highlighted-fence/highlighted-code')
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
  const checkboxClick = useCallback(
    (lineInMarkdown: number, newValue: boolean) => {
      onTaskCheckedChange(newValue)
    },
    [onTaskCheckedChange]
  )

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
          <DocumentMarkdownRenderer
            markdownContentLines={lines}
            baseUrl={'https://example.org'}
            onTaskCheckedChange={checkboxClick}
          />
        </td>
        <td className={'markdown-body'}>
          <HighlightedCode code={markdown} wrapLines={true} startLineNumber={1} language={'markdown'} />
        </td>
      </tr>
    </Suspense>
  )
}
