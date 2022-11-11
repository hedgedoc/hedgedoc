/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import KaTeX from 'katex'
import convertHtmlToReact from '@hedgedoc/html-to-react'
import 'katex/dist/katex.min.css'
import { Alert } from 'react-bootstrap'
import { sanitize } from 'dompurify'
import { testId } from '../../../utils/test-id'

interface KatexFrameProps {
  expression: string
  block?: boolean
}

/**
 * Renders a LaTeX expression.
 *
 * @param expression The mathematical expression to render
 * @param block Defines if the output should be a block or inline.
 */
export const KatexFrame: React.FC<KatexFrameProps> = ({ expression, block = false }) => {
  const dom = useMemo(() => {
    try {
      const katexHtml = KaTeX.renderToString(expression, {
        displayMode: block === true,
        throwOnError: true
      })
      return convertHtmlToReact(sanitize(katexHtml, { ADD_TAGS: ['semantics', 'annotation'] }))
    } catch (error) {
      return (
        <Alert className={block ? '' : 'd-inline-block'} variant={'danger'}>
          {(error as Error).message}
        </Alert>
      )
    }
  }, [block, expression])

  return block ? <div {...testId('katex-block')}>{dom}</div> : <span {...testId('katex-inline')}>{dom}</span>
}

export default KatexFrame
