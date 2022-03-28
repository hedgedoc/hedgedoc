/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react'
import React, { Fragment } from 'react'
import { MarkdownExtensionCollection } from '../../markdown-extension-collection'
import convertHtmlToReact from '@hedgedoc/html-to-react'
import { useAsync } from 'react-use'
import { Logger } from '../../../../../utils/logger'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const nodeProcessor = new MarkdownExtensionCollection([]).buildFlatNodeProcessor()

/**
 * Converts the given html code to react elements without any custom transformation but with sanitizing.
 *
 * @param code The code to convert
 * @return the code represented as react elements
 */
const createHtmlLinesToReactDOM = (code: string[]): ReactElement[] => {
  return code.map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {convertHtmlToReact(line, {
        preprocessNodes: nodeProcessor
      })}
    </Fragment>
  ))
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

export interface HighlightedCodeProps {
  code: string
  language?: string
  startLineNumber?: number
}

const log = new Logger('HighlightedCode')

/**
 * Highlights the given code using highlight.js. If the language wasn't recognized then it won't be highlighted.
 *
 * @param code The code to highlight
 * @param language The language of the code to use for highlighting
 * @return {@link AsyncState async state} that contains the converted React elements
 */
export const useAsyncHighlightedCodeDom = (code: string, language?: string): AsyncState<ReactElement[]> => {
  return useAsync(async () => {
    try {
      const hljs = (await import(/* webpackChunkName: "highlight.js" */ '../../../../common/hljs/hljs')).default
      if (!!language && hljs.listLanguages().includes(language)) {
        const highlightedHtml = hljs.highlight(code, { language }).value
        return createHtmlLinesToReactDOM(omitNewLineAtEnd(highlightedHtml).split('\n'))
      } else {
        return createPlaintextToReactDOM(code)
      }
    } catch (error) {
      log.error('Error while loading highlight.js', error)
      throw error
    }
  }, [code, language])
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
