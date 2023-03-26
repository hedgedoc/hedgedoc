/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../hooks/common/use-note-details'
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'
import { setRendererStatus } from '../../../redux/renderer-status/methods'
import { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import type { RenderIframeProps } from '../renderer-pane/render-iframe'
import { RenderIframe } from '../renderer-pane/render-iframe'
import { useOnScrollWithLineOffset } from './hooks/use-on-scroll-with-line-offset'
import { useScrollStateWithoutLineOffset } from './hooks/use-scroll-state-without-line-offset'
import { NoteType } from '@hedgedoc/commons'
import React from 'react'

export type EditorDocumentRendererProps = Omit<
  RenderIframeProps,
  'markdownContentLines' | 'rendererType' | 'onTaskCheckedChange'
>

/**
 * Renders the markdown content from the global application state with the iframe renderer.
 *
 * @param scrollState The {@link ScrollState} that should be sent to the renderer
 * @param onScroll A callback that is executed when the view in the rendered is scrolled
 * @param props Every property from the {@link RenderIframe} except the markdown content
 */
export const EditorDocumentRenderer: React.FC<EditorDocumentRendererProps> = ({ scrollState, onScroll, ...props }) => {
  const trimmedContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  const noteType: NoteType = useNoteDetails().frontmatter.type
  const adjustedOnScroll = useOnScrollWithLineOffset(onScroll)
  const adjustedScrollState = useScrollStateWithoutLineOffset(scrollState)

  return (
    <RenderIframe
      {...props}
      onScroll={adjustedOnScroll}
      scrollState={adjustedScrollState}
      rendererType={noteType === NoteType.SLIDE ? RendererType.SLIDESHOW : RendererType.DOCUMENT}
      markdownContentLines={trimmedContentLines}
      onRendererStatusChange={setRendererStatus}
    />
  )
}
