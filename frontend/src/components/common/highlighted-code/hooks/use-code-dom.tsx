/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HtmlToReact } from '../../html-to-react/html-to-react'
import type { HLJSApi } from 'highlight.js'
import type { ReactElement } from 'react'
import React, { useMemo } from 'react'

/**
 * Highlights the given code using highlight.js. If the language wasn't recognized then it won't be highlighted.
 *
 * @param code The code to highlight
 * @param hljs The highlight.js API. Needs to be imported or lazy loaded.
 * @param language The language of the code to use for highlighting
 * @return The react elements that represent the highlighted code
 */
export const useCodeDom = (code: string, hljs: HLJSApi | undefined, language?: string): ReactElement[] | null => {
  return useMemo(() => {
    if (!hljs) {
      return null
    }
    if (!!language && hljs.listLanguages().includes(language)) {
      const highlightedHtml = hljs.highlight(code, { language }).value
      return createHtmlLinesToReactDOM(omitNewLineAtEnd(highlightedHtml).split('\n'))
    } else {
      return createPlaintextToReactDOM(code)
    }
  }, [code, hljs, language])
}

/**
 * Converts the given html code to react elements without any custom transformation but with sanitizing.
 *
 * @param code The code to convert
 * @return the code represented as react elements
 */
const createHtmlLinesToReactDOM = (code: string[]): ReactElement[] => {
  return code.map((line, lineIndex) => <HtmlToReact htmlCode={line} key={lineIndex} />)
}

/**
 * Converts the given line based text to plain text react elements but without interpreting them as html first.
 *
 * @param text The text to convert
 * @return the text represented as react elements.
 */
const createPlaintextToReactDOM = (text: string): ReactElement[] => {
  return text.split('\n').map((line, lineIndex) => React.createElement('span', { key: lineIndex }, line))
}

/**
 * Returns the given code but without the last new line if the string ends with a new line.
 *
 * @param code The code to inspect
 * @return the modified code
 */
const omitNewLineAtEnd = (code: string): string => {
  if (code.endsWith('\n')) {
    return code.slice(0, -1)
  } else {
    return code
  }
}
