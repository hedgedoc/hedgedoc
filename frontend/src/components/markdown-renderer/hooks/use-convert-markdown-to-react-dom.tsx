/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../extensions/base/markdown-renderer-extension'
import { SanitizerMarkdownExtension } from '../extensions/sanitizer/sanitizer-markdown-extension'
import type { ValidReactDomElement } from '../replace-components/component-replacer'
import { LineIdMapper } from '../utils/line-id-mapper'
import { NodeToReactTransformer } from '../utils/node-to-react-transformer'
import { useCombinedNodePreprocessor } from './use-combined-node-preprocessor'
import { useConfiguredMarkdownIt } from './use-configured-markdown-it'
import convertHtmlToReact from '@hedgedoc/html-to-react'
import React, { Fragment, useMemo } from 'react'

/**
 * Renders Markdown-Code into react elements.
 *
 * @param markdownContentLines The Markdown code lines that should be rendered
 * @param additionalMarkdownExtensions A list of {@link MarkdownRendererExtension markdown extensions} that should be used
 * @param newlinesAreBreaks Defines if the alternative break mode of markdown it should be used
 * @param allowHtml Defines if html is allowed in markdown
 * @return The React DOM that represents the rendered Markdown code
 */
export const useConvertMarkdownToReactDom = (
  markdownContentLines: string[],
  additionalMarkdownExtensions: MarkdownRendererExtension[],
  newlinesAreBreaks = true,
  allowHtml = true
): ValidReactDomElement => {
  const lineNumberMapper = useMemo(() => new LineIdMapper(), [])
  const htmlToReactTransformer = useMemo(() => new NodeToReactTransformer(), [])
  const markdownExtensions = useMemo(() => {
    const tagWhiteLists = additionalMarkdownExtensions.flatMap((extension) => extension.buildTagNameAllowList())
    return [...additionalMarkdownExtensions, new SanitizerMarkdownExtension(tagWhiteLists)]
  }, [additionalMarkdownExtensions])

  useMemo(() => {
    htmlToReactTransformer.setReplacers(markdownExtensions.flatMap((extension) => extension.buildReplacers()))
  }, [htmlToReactTransformer, markdownExtensions])

  useMemo(() => {
    htmlToReactTransformer.setLineIds(lineNumberMapper.updateLineMapping(markdownContentLines))
  }, [htmlToReactTransformer, lineNumberMapper, markdownContentLines])

  const nodePreProcessor = useCombinedNodePreprocessor(markdownExtensions)
  const markdownIt = useConfiguredMarkdownIt(markdownExtensions, allowHtml, newlinesAreBreaks)

  return useMemo(() => {
    const html = markdownIt.render(markdownContentLines.join('\n'))
    htmlToReactTransformer.resetReplacers()

    return (
      <Fragment key={'root'}>
        {convertHtmlToReact(html, {
          transform: (node, index) => htmlToReactTransformer.translateNodeToReactElement(node, index),
          preprocessNodes: (document) => nodePreProcessor(document)
        })}
      </Fragment>
    )
  }, [htmlToReactTransformer, markdownContentLines, markdownIt, nodePreProcessor])
}
