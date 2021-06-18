/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import { useMemo, useRef } from 'react'
import { ComponentReplacer, ValidReactDomElement } from '../replace-components/ComponentReplacer'
import { LineKeys } from '../types'
import { buildTransformer } from '../utils/html-react-transformer'
import { calculateNewLineNumberMapping } from '../utils/line-number-mapping'
import convertHtmlToReact from '@hedgedoc/html-to-react'

/**
 * Renders markdown code into react elements
 *
 * @param markdownCode The markdown code that should be rendered
 * @param markdownIt The configured {@link MarkdownIt markdown it} instance that should render the code
 * @param replacers A function that provides a list of {@link ComponentReplacer component replacers}
 * @param onBeforeRendering A callback that gets executed before the rendering
 * @param onAfterRendering A callback that gets executed after the rendering
 * @return The React DOM that represents the rendered markdown code
 */
export const useConvertMarkdownToReactDom = (
  markdownCode: string,
  markdownIt: MarkdownIt,
  replacers: () => ComponentReplacer[],
  onBeforeRendering?: () => void,
  onAfterRendering?: () => void
): ValidReactDomElement[] => {
  const oldMarkdownLineKeys = useRef<LineKeys[]>()
  const lastUsedLineId = useRef<number>(0)

  return useMemo(() => {
    if (onBeforeRendering) {
      onBeforeRendering()
    }
    const html = markdownIt.render(markdownCode)
    const contentLines = markdownCode.split('\n')
    const { lines: newLines, lastUsedLineId: newLastUsedLineId } = calculateNewLineNumberMapping(
      contentLines,
      oldMarkdownLineKeys.current ?? [],
      lastUsedLineId.current
    )
    oldMarkdownLineKeys.current = newLines
    lastUsedLineId.current = newLastUsedLineId

    const currentReplacers = replacers()
    const transformer = currentReplacers.length > 0 ? buildTransformer(newLines, currentReplacers) : undefined
    const rendering = convertHtmlToReact(html, { transform: transformer })
    if (onAfterRendering) {
      onAfterRendering()
    }
    return rendering
  }, [onBeforeRendering, markdownIt, markdownCode, replacers, onAfterRendering])
}
