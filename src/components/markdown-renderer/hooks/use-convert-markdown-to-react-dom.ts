/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import { ReactElement, useMemo, useRef } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { ComponentReplacer } from '../replace-components/ComponentReplacer'
import { LineKeys } from '../types'
import { buildTransformer } from '../utils/html-react-transformer'
import { calculateNewLineNumberMapping } from '../utils/line-number-mapping'

export const useConvertMarkdownToReactDom = (
  markdownCode: string,
  markdownIt: MarkdownIt,
  componentReplacers?: () => ComponentReplacer[],
  onPreRendering?: () => void,
  onPostRendering?: () => void): ReactElement[] => {
  const oldMarkdownLineKeys = useRef<LineKeys[]>()
  const lastUsedLineId = useRef<number>(0)

  return useMemo(() => {
    if (onPreRendering) {
      onPreRendering()
    }
    const html = markdownIt.render(markdownCode)
    const contentLines = markdownCode.split('\n')
    const {
      lines: newLines,
      lastUsedLineId: newLastUsedLineId
    } = calculateNewLineNumberMapping(contentLines, oldMarkdownLineKeys.current ?? [], lastUsedLineId.current)
    oldMarkdownLineKeys.current = newLines
    lastUsedLineId.current = newLastUsedLineId
    const transformer = componentReplacers ? buildTransformer(newLines, componentReplacers()) : undefined
    const rendering = ReactHtmlParser(html, { transform: transformer })
    if (onPostRendering) {
      onPostRendering()
    }
    return rendering
  }, [onPreRendering, onPostRendering, markdownCode, markdownIt, componentReplacers])
}
