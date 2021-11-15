/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react'
import React, { Fragment, useEffect, useState } from 'react'
import convertHtmlToReact from '@hedgedoc/html-to-react'
import { CopyToClipboardButton } from '../../../common/copyable/copy-to-clipboard-button/copy-to-clipboard-button'
import '../../utils/button-inside.scss'
import './highlighted-code.scss'
import { Logger } from '../../../../utils/logger'
import { cypressId } from '../../../../utils/cypress-attribute'

const log = new Logger('HighlightedCode')

export interface HighlightedCodeProps {
  code: string
  language?: string
  startLineNumber?: number
  wrapLines: boolean
}

/*
 TODO: Test method or rewrite code so this is not necessary anymore
 */
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replaceAll(/&/g, '&amp;')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;')
    .replaceAll(/"/g, '&quot;')
    .replaceAll(/'/g, '&#039;')
}

const replaceCode = (code: string): (ReactElement | null | string)[][] => {
  return code
    .split('\n')
    .filter((line) => !!line)
    .map((line) => convertHtmlToReact(line, {}))
}

export const HighlightedCode: React.FC<HighlightedCodeProps> = ({ code, language, startLineNumber, wrapLines }) => {
  const [dom, setDom] = useState<ReactElement[]>()

  useEffect(() => {
    import(/* webpackChunkName: "highlight.js" */ '../../../common/hljs/hljs')
      .then((hljs) => {
        const languageSupported = (lang: string) => hljs.default.listLanguages().includes(lang)
        const unreplacedCode =
          !!language && languageSupported(language)
            ? hljs.default.highlight(code, { language }).value
            : escapeHtml(code)
        const replacedDom = replaceCode(unreplacedCode).map((line, index) => (
          <Fragment key={index}>
            <span className={'linenumber'}>{(startLineNumber || 1) + index}</span>
            <div className={'codeline'}>{line}</div>
          </Fragment>
        ))
        setDom(replacedDom)
      })
      .catch((error: Error) => {
        log.error('Error while loading highlight.js', error)
      })
  }, [code, language, startLineNumber])

  return (
    <div className={'code-highlighter'}>
      <code className={`hljs ${startLineNumber !== undefined ? 'showGutter' : ''} ${wrapLines ? 'wrapLines' : ''}`}>
        {dom}
      </code>
      <div className={'text-right button-inside'}>
        <CopyToClipboardButton content={code} {...cypressId('copy-code-button')} />
      </div>
    </div>
  )
}

export default HighlightedCode
