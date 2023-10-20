/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'
import { setRendererStatus } from '../../../redux/renderer-status/methods'
import type { RendererIframeProps } from '../../common/renderer-iframe/renderer-iframe'
import { RendererIframe } from '../../common/renderer-iframe/renderer-iframe'
import { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import { useOnScrollWithLineOffset } from './hooks/use-on-scroll-with-line-offset'
import { useScrollStateWithoutLineOffset } from './hooks/use-scroll-state-without-line-offset'
import { NoteType } from '@hedgedoc/commons'
import React from 'react'

export type RendererPaneProps = Omit<
  RendererIframeProps,
  'markdownContentLines' | 'rendererType' | 'onTaskCheckedChange'
>

/**
 * Renders the markdown content from the global application state with the iframe renderer.
 *
 * @param scrollState The {@link ScrollState} that should be sent to the renderer
 * @param onScroll A callback that is executed when the view in the rendered is scrolled
 * @param props Every property from the {@link RendererIframe} except the markdown content
 */
export const RendererPane: React.FC<RendererPaneProps> = ({ scrollState, onScroll, ...props }) => {
  const trimmedContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  const noteType = useApplicationState((state) => state.noteDetails?.frontmatter.type)
  const adjustedOnScroll = useOnScrollWithLineOffset(onScroll ?? null)
  const adjustedScrollState = useScrollStateWithoutLineOffset(scrollState ?? null)

  if (!noteType) {
    return null
  }

  return (
    <RendererIframe
      {...props}
      onScroll={adjustedOnScroll}
      scrollState={adjustedScrollState}
      rendererType={noteType === NoteType.SLIDE ? RendererType.SLIDESHOW : RendererType.DOCUMENT}
      markdownContentLines={trimmedContentLines}
      onRendererStatusChange={setRendererStatus}
    />
  )
}
