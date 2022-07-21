/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import { useMemo } from 'react'
import type { ValidReactDomElement } from '../replace-components/component-replacer'
import convertHtmlToReact from '@hedgedoc/html-to-react'
import { NodeToReactTransformer } from '../utils/node-to-react-transformer'
import { LineIdMapper } from '../utils/line-id-mapper'
import type { MarkdownExtension } from '../markdown-extension/markdown-extension'
import { MarkdownExtensionCollection } from '../markdown-extension/markdown-extension-collection'

/**
 * Renders Markdown-Code into react elements.
 *
 * @param markdownContentLines The markdown code lines that should be rendered
 * @param additionalMarkdownExtensions A list of {@link MarkdownExtension markdown extensions} that should be used
 * @param newlinesAreBreaks Defines if the alternative break mode of markdown it should be used
 * @param allowHtml Defines if html is allowed in markdown
 * @return The React DOM that represents the rendered markdown code
 */
export const useConvertMarkdownToReactDom = (
  markdownContentLines: string[],
  additionalMarkdownExtensions: MarkdownExtension[],
  newlinesAreBreaks = true,
  allowHtml = true
): ValidReactDomElement[] => {
  const lineNumberMapper = useMemo(() => new LineIdMapper(), [])
  const htmlToReactTransformer = useMemo(() => new NodeToReactTransformer(), [])
  const markdownExtensions = useMemo(
    () => new MarkdownExtensionCollection(additionalMarkdownExtensions),
    [additionalMarkdownExtensions]
  )

  const markdownIt = useMemo(() => {
    const newMarkdownIt = new MarkdownIt('default', {
      html: allowHtml,
      breaks: newlinesAreBreaks,
      langPrefix: '',
      typographer: true
    })
    markdownExtensions.configureMarkdownIt(newMarkdownIt)
    return newMarkdownIt
  }, [allowHtml, markdownExtensions, newlinesAreBreaks])

  useMemo(() => {
    htmlToReactTransformer.setReplacers(markdownExtensions.buildReplacers())
  }, [htmlToReactTransformer, markdownExtensions])

  useMemo(() => {
    htmlToReactTransformer.setLineIds(lineNumberMapper.updateLineMapping(markdownContentLines))
  }, [htmlToReactTransformer, lineNumberMapper, markdownContentLines])

  const nodePreProcessor = useMemo(() => markdownExtensions.buildFlatNodeProcessor(), [markdownExtensions])

  return useMemo(() => {
    const html = markdownIt.render(markdownContentLines.join('\n'))
    htmlToReactTransformer.resetReplacers()

    return convertHtmlToReact(html, {
      transform: (node, index) => htmlToReactTransformer.translateNodeToReactElement(node, index),
      preprocessNodes: (document) => nodePreProcessor(document)
    })
  }, [htmlToReactTransformer, markdownContentLines, markdownIt, nodePreProcessor])
}
