/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, ReactElement, useEffect, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { CopyToClipboardButton } from '../../../../common/copyable/copy-to-clipboard-button/copy-to-clipboard-button'
import '../../../utils/button-inside.scss'
import './highlighted-code.scss'

export interface HighlightedCodeProps {
  code: string,
  language?: string,
  startLineNumber?: number
  wrapLines: boolean
}

export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const correctLanguage = (language: string | undefined): string | undefined => {
  switch (language) {
    case 'html':
      return 'xml'
    case 'js':
      return 'javascript'
    default:
      return language
  }
}

const replaceCode = (code: string): ReactElement[][] => {
  return code.split('\n')
    .filter(line => !!line)
    .map(line => ReactHtmlParser(line))
}

export const HighlightedCode: React.FC<HighlightedCodeProps> = ({ code, language, startLineNumber, wrapLines }) => {
  const [dom, setDom] = useState<ReactElement[]>()

  useEffect(() => {
    import(/* webpackChunkName: "highlight.js" */ 'highlight.js').then((hljs) => {
      const correctedLanguage = correctLanguage(language)
      const languageSupported = (lang: string) => hljs.listLanguages().includes(lang)
      const unreplacedCode = !!correctedLanguage && languageSupported(correctedLanguage) ? hljs.highlight(correctedLanguage, code).value : escapeHtml(code)
      const replacedDom = replaceCode(unreplacedCode).map((line, index) => (
        <Fragment key={index}>
          <span className={'linenumber'} data-line-number={(startLineNumber || 1) + index}/>
          <div className={'codeline'}>
            {line}
          </div>
        </Fragment>
      ))
      setDom(replacedDom)
    }).catch(() => { console.error('error while loading highlight.js') })
  }, [code, language, startLineNumber])

  return (
    <Fragment>
      <code className={`hljs ${startLineNumber !== undefined ? 'showGutter' : ''} ${wrapLines ? 'wrapLines' : ''}`}>
        { dom }
      </code>
      <div className={'text-right button-inside'}>
        <CopyToClipboardButton content={code}/>
      </div>
    </Fragment>)
}
