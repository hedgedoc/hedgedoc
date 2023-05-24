/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RevealMarkdownExtension } from '../../../markdown-renderer/extensions/reveal/reveal-markdown-extension'
import { useMarkdownExtensions } from '../../../markdown-renderer/hooks/use-markdown-extensions'
import { REVEAL_STATUS, useReveal } from '../../../markdown-renderer/hooks/use-reveal'
import { MarkdownToReact } from '../../../markdown-renderer/markdown-to-react/markdown-to-react'
import { RendererType } from '../../window-post-message-communicator/rendering-message'
import type { CommonMarkdownRendererProps } from '../common-markdown-renderer-props'
import { LoadingSlide } from './loading-slide'
import styles from './slideshow.module.scss'
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
 * @param newLinesAreBreaks If newlines are rendered as breaks or not
 */
export const SlideshowMarkdownRenderer: React.FC<SlideshowMarkdownRendererProps> = ({
  markdownContentLines,
  baseUrl,
  newLinesAreBreaks,
  slideOptions
}) => {
  const markdownBodyRef = useRef<HTMLDivElement>(null)

  const extensions = useMarkdownExtensions(
    baseUrl,
    RendererType.SLIDESHOW,
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
          newlinesAreBreaks={newLinesAreBreaks}
        />
      ) : (
        <LoadingSlide />
      ),
    [extensions, markdownContentLines, newLinesAreBreaks, revealStatus]
  )

  return (
    <div className={styles.wrapper}>
      <div className={'reveal'}>
        <div ref={markdownBodyRef} className={`slides`}>
          {slideShowDOM}
        </div>
      </div>
    </div>
  )
}
