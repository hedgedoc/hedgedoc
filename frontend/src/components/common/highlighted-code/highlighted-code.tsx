/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { testId } from '../../../utils/test-id'
import { AsyncLoadingBoundary } from '../async-loading-boundary/async-loading-boundary'
import { CopyToClipboardButton } from '../copyable/copy-to-clipboard-button/copy-to-clipboard-button'
import styles from './highlighted-code.module.scss'
import { useAsyncHighlightJsImport } from './hooks/use-async-highlight-js-import'
import { useAttachLineNumbers } from './hooks/use-attach-line-numbers'
import { useCodeDom } from './hooks/use-code-dom'
import React, { useMemo } from 'react'

export interface HighlightedCodeProps {
  code: string
  language?: string
  startLineNumber?: number
  wrapLines: boolean
}

/**
 * Shows the given code as highlighted code block.
 *
 * @param code The code to highlight
 * @param language The language that should be used for highlighting
 * @param startLineNumber The number of the first line in the block. Will be 1 if omitted.
 * @param wrapLines Defines if lines should be wrapped or if the block should show a scroll bar.
 * @see https://highlightjs.org/
 */
export const HighlightedCode: React.FC<HighlightedCodeProps> = ({ code, language, startLineNumber, wrapLines }) => {
  const showGutter = startLineNumber !== undefined
  const { value: hljsApi, loading, error } = useAsyncHighlightJsImport()
  const codeDom = useCodeDom(code, hljsApi, language)
  const wrappedDomLines = useAttachLineNumbers(codeDom, startLineNumber)

  const className = useMemo(() => {
    return concatCssClasses('hljs', {
      [styles['showGutter']]: showGutter,
      [styles['wrapLines']]: wrapLines
    })
  }, [showGutter, wrapLines])

  return (
    <AsyncLoadingBoundary loading={loading || !hljsApi} error={!!error} componentName={'highlight.js'}>
      <div className={styles['code-highlighter']} {...cypressId('highlighted-code-block')}>
        <code
          {...testId('code-highlighter')}
          {...cypressId('code-highlighter')}
          {...cypressAttribute('showgutter', showGutter ? 'true' : 'false')}
          {...cypressAttribute('wraplines', wrapLines ? 'true' : 'false')}
          className={className}>
          {wrappedDomLines}
        </code>
        <div className={'text-right button-inside'}>
          <CopyToClipboardButton content={code} {...cypressId('copy-code-button')} />
        </div>
      </div>
    </AsyncLoadingBoundary>
  )
}

export default HighlightedCode
