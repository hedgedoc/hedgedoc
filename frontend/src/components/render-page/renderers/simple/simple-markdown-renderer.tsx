/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { useApplyDarkModeStyle } from '../../../layout/dark-mode/use-apply-dark-mode-style'
import { useMarkdownExtensions } from '../../../markdown-renderer/hooks/use-markdown-extensions'
import { MarkdownToReact } from '../../../markdown-renderer/markdown-to-react/markdown-to-react'
import { useOnHeightChange } from '../../hooks/use-on-height-change'
import { useTransparentBodyBackground } from '../../hooks/use-transparent-body-background'
import { RendererType } from '../../window-post-message-communicator/rendering-message'
import type { CommonMarkdownRendererProps, HeightChangeRendererProps } from '../common-markdown-renderer-props'
import React, { useRef } from 'react'

export type SimpleMarkdownRendererProps = CommonMarkdownRendererProps & HeightChangeRendererProps

/**
 * Renders just the given Markdown content without scrolling, slideshow, toc notifying and other additions.
 *
 * @param additionalOuterContainerClasses Additional classes given to the outer container directly
 * @param baseUrl The base url for the renderer
 * @param markdownContentLines The current content of the markdown document.
 * @param onHeightChange The callback to call if the height of the document changes
 */
export const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({
  baseUrl,
  markdownContentLines,
  onHeightChange,
  newLinesAreBreaks
}) => {
  const rendererRef = useRef<HTMLDivElement | null>(null)
  useOnHeightChange(rendererRef, onHeightChange)
  const extensions = useMarkdownExtensions(baseUrl, RendererType.SIMPLE, [])

  useTransparentBodyBackground()
  useApplyDarkModeStyle()

  return (
    <div className={`vh-100 bg-transparent overflow-y-hidden`}>
      <div ref={rendererRef} className={`position-relative`}>
        <div
          {...cypressId('markdown-body')}
          data-word-count-target={true}
          className={`markdown-body w-100 d-flex flex-column align-items-center`}>
          <MarkdownToReact
            markdownContentLines={markdownContentLines}
            markdownRenderExtensions={extensions}
            newlinesAreBreaks={newLinesAreBreaks}
            allowHtml={true}
          />
        </div>
      </div>
    </div>
  )
}
