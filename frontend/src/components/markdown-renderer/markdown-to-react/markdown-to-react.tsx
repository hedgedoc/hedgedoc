/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { measurePerformance } from '../../../utils/measure-performance'
import { HtmlToReact } from '../../common/html-to-react/html-to-react'
import type { MarkdownRendererExtension } from '../extensions/_base-classes/markdown-renderer-extension'
import { useCombinedNodePreprocessor } from './hooks/use-combined-node-preprocessor'
import { useConfiguredMarkdownIt } from './hooks/use-configured-markdown-it'
import { LineContentToLineIdMapper } from './utils/line-content-to-line-id-mapper'
import { NodeToReactTransformer } from './utils/node-to-react-transformer'
import type { ParserOptions } from '@hedgedoc/html-to-react'
import type DOMPurify from 'dompurify'
import React, { useEffect, useMemo } from 'react'

export interface MarkdownToReactProps {
  markdownContentLines: string[]
  markdownRenderExtensions: MarkdownRendererExtension[]
  newlinesAreBreaks?: boolean
  allowHtml: boolean
}

/**
 * Renders Markdown code as DOM
 *
 * @param markdownContentLines The Markdown code lines that should be rendered
 * @param additionalMarkdownExtensions A list of {@link MarkdownRendererExtension markdown extensions} that should be used
 * @param newlinesAreBreaks Defines if the alternative break mode of markdown it should be used
 * @param allowHtml Defines if html is allowed in markdown
 * @see https://markdown-it.github.io/
 */
export const MarkdownToReact: React.FC<MarkdownToReactProps> = ({
  markdownContentLines,
  markdownRenderExtensions,
  newlinesAreBreaks,
  allowHtml
}) => {
  const lineNumberMapper = useMemo(() => new LineContentToLineIdMapper(), [])
  const nodeToReactTransformer = useMemo(() => new NodeToReactTransformer(), [])

  useMemo(() => {
    nodeToReactTransformer.setReplacers(markdownRenderExtensions.flatMap((extension) => extension.buildReplacers()))
    return null //todo: replace usememo hack
  }, [nodeToReactTransformer, markdownRenderExtensions])

  useMemo(() => {
    measurePerformance('markdown-to-react: update-line-mapping', () => {
      nodeToReactTransformer.setLineIds(lineNumberMapper.updateLineMapping(markdownContentLines))
    })
    return null
  }, [nodeToReactTransformer, lineNumberMapper, markdownContentLines])

  const nodePreProcessor = useCombinedNodePreprocessor(markdownRenderExtensions)
  const markdownIt = useConfiguredMarkdownIt(markdownRenderExtensions, allowHtml, newlinesAreBreaks ?? true)

  const parserOptions: ParserOptions = useMemo(
    () => ({
      transform: (node, index) => nodeToReactTransformer.translateNodeToReactElement(node, index),
      preprocessNodes: (document) => {
        nodeToReactTransformer.resetReplacers()
        return nodePreProcessor(document)
      }
    }),
    [nodeToReactTransformer, nodePreProcessor]
  )

  const html = useMemo(() => {
    return measurePerformance('markdown-to-react: markdown-it', () =>
      markdownIt.render(markdownContentLines.join('\n'))
    )
  }, [markdownContentLines, markdownIt])
  const domPurifyConfig: DOMPurify.Config = useMemo(
    () => ({
      ADD_TAGS: markdownRenderExtensions.flatMap((extension) => extension.buildTagNameAllowList())
    }),
    [markdownRenderExtensions]
  )

  useEffect(() => {
    markdownRenderExtensions.forEach((extension) => extension.doAfterRendering())
  }, [html, markdownRenderExtensions])

  return <HtmlToReact htmlCode={html} parserOptions={parserOptions} domPurifyConfig={domPurifyConfig} />
}
