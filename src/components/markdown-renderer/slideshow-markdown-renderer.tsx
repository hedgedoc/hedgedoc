/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useMemo, useRef } from 'react'
import { useConvertMarkdownToReactDom } from './hooks/use-convert-markdown-to-react-dom'
import './markdown-renderer.scss'
import { useComponentReplacers } from './hooks/use-component-replacers'
import { useExtractFirstHeadline } from './hooks/use-extract-first-headline'
import { TocAst } from 'markdown-it-toc-done-right'
import { useOnRefChange } from './hooks/use-on-ref-change'
import { useTrimmedContent } from './hooks/use-trimmed-content'
import { REVEAL_STATUS, useReveal } from './hooks/use-reveal'
import './slideshow.scss'
import { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import { DocumentLengthLimitReachedAlert } from './document-length-limit-reached-alert'
import { BasicMarkdownItConfigurator } from './markdown-it-configurator/basic-markdown-it-configurator'
import { SlideOptions } from '../common/note-frontmatter/types'
import { processRevealCommentNodes } from './process-reveal-comment-nodes'
import { CommonMarkdownRendererProps } from './common-markdown-renderer-props'
import { LoadingSlide } from './loading-slide'

export interface SlideshowMarkdownRendererProps extends CommonMarkdownRendererProps {
  slideOptions: SlideOptions
}

export const SlideshowMarkdownRenderer: React.FC<SlideshowMarkdownRendererProps & ScrollProps> = ({
  className,
  content,
  onFirstHeadingChange,
  onTaskCheckedChange,
  onTocChange,
  baseUrl,
  onImageClick,
  useAlternativeBreaks,
  lineOffset,
  slideOptions
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const tocAst = useRef<TocAst>()
  const [trimmedContent, contentExceedsLimit] = useTrimmedContent(content)

  const markdownIt = useMemo(
    () =>
      new BasicMarkdownItConfigurator({
        onToc: (toc) => (tocAst.current = toc),
        useAlternativeBreaks,
        lineOffset,
        headlineAnchors: false,
        slideSections: true
      }).buildConfiguredMarkdownIt(),
    [lineOffset, useAlternativeBreaks]
  )
  const replacers = useComponentReplacers(onTaskCheckedChange, onImageClick, baseUrl, lineOffset)
  const markdownReactDom = useConvertMarkdownToReactDom(
    trimmedContent,
    markdownIt,
    replacers,
    processRevealCommentNodes
  )
  const revealStatus = useReveal(content, slideOptions)

  useExtractFirstHeadline(
    markdownBodyRef,
    revealStatus === REVEAL_STATUS.INITIALISED ? content : undefined,
    onFirstHeadingChange
  )
  useOnRefChange(tocAst, onTocChange)

  const slideShowDOM = useMemo(
    () => (revealStatus === REVEAL_STATUS.INITIALISED ? markdownReactDom : <LoadingSlide />),
    [markdownReactDom, revealStatus]
  )

  return (
    <Fragment>
      <DocumentLengthLimitReachedAlert show={contentExceedsLimit} />
      <div className={'reveal'}>
        <div ref={markdownBodyRef} className={`${className ?? ''} slides`}>
          {slideShowDOM}
        </div>
      </div>
    </Fragment>
  )
}

export default SlideshowMarkdownRenderer
