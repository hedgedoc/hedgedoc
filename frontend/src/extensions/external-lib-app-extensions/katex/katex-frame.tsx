/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HtmlToReact } from '../../../components/common/html-to-react/html-to-react'
import { testId } from '../../../utils/test-id'
import KaTeX from 'katex'
import 'katex/dist/katex.min.css'
import React, { useMemo } from 'react'
import { ApplicationErrorAlert } from '../../../components/common/application-error-alert/application-error-alert'

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
        displayMode: block,
        throwOnError: true
      })
      return (
        <HtmlToReact htmlCode={katexHtml} domPurifyConfig={{ ADD_TAGS: ['semantics', 'annotation'] }}></HtmlToReact>
      )
    } catch (error) {
      return (
        <ApplicationErrorAlert className={block ? '' : 'd-inline-block'}>
          {(error as Error).message}
        </ApplicationErrorAlert>
      )
    }
  }, [block, expression])

  return block ? <p {...testId('katex-block')}>{dom}</p> : <span {...testId('katex-inline')}>{dom}</span>
}

export default KatexFrame
