/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useCallback } from 'react'
import { WaitSpinner } from '../../../common/wait-spinner/wait-spinner'

export interface CheatsheetLineProps {
  code: string
  onTaskCheckedChange: (newValue: boolean) => void
}

const HighlightedCode = React.lazy(
  () => import('../../../markdown-renderer/markdown-extension/highlighted-fence/highlighted-code')
)
const DocumentMarkdownRenderer = React.lazy(() => import('../../../markdown-renderer/document-markdown-renderer'))

export const CheatsheetLine: React.FC<CheatsheetLineProps> = ({ code, onTaskCheckedChange }) => {
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
            content={code}
            baseUrl={'https://example.org'}
            onTaskCheckedChange={checkboxClick}
          />
        </td>
        <td className={'markdown-body'}>
          <HighlightedCode code={code} wrapLines={true} startLineNumber={1} language={'markdown'} />
        </td>
      </tr>
    </Suspense>
  )
}
