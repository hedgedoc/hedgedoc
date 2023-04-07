/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ScrollProps } from '../editor-page/synced-scroll/scroll-props'
import type { CommonMarkdownRendererProps } from './common-markdown-renderer-props'
import { RevealMarkdownExtension } from './extensions/reveal/reveal-markdown-extension'
import { useMarkdownExtensions } from './hooks/use-markdown-extensions'
import { REVEAL_STATUS, useReveal } from './hooks/use-reveal'
import { LoadingSlide } from './loading-slide'
import { MarkdownToReact } from './markdown-to-react/markdown-to-react'
import type { SlideOptions } from '@hedgedoc/commons'
import React, { useMemo, useRef } from 'react'

export interface SlideshowMarkdownRendererProps extends CommonMarkdownRendererProps {
  slideOptions?: SlideOptions
}

/**
 * Renders the note as a reveal.js presentation.
 *
 * @param className Additional class names directly given to the div
 * @param markdownContentLines The markdown lines
 * @param baseUrl The base url of the renderer
 * @param newlinesAreBreaks If newlines are rendered as breaks or not
 * @param slideOptions The {@link SlideOptions} to use
 */
export const SlideshowMarkdownRenderer: React.FC<SlideshowMarkdownRendererProps & ScrollProps> = ({
  className,
  markdownContentLines,
  baseUrl,
  newlinesAreBreaks,
  slideOptions
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)

  const extensions = useMarkdownExtensions(
    baseUrl,
    useMemo(() => [new RevealMarkdownExtension()], [])
  )

  const revealStatus = useReveal(markdownContentLines, slideOptions)

  const slideShowDOM = useMemo(
    () =>
      revealStatus === REVEAL_STATUS.INITIALISED ? (
        <MarkdownToReact
          markdownContentLines={markdownContentLines}
          markdownRenderExtensions={extensions}
          allowHtml={true}
          newlinesAreBreaks={newlinesAreBreaks}
        />
      ) : (
        <LoadingSlide />
      ),
    [extensions, markdownContentLines, newlinesAreBreaks, revealStatus]
  )

  return (
    <div className={'reveal'}>
      <div ref={markdownBodyRef} className={`${className ?? ''} slides`}>
        {slideShowDOM}
      </div>
    </div>
  )
}
