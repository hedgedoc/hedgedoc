/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import {
  CommunicationMessageType,
  RendererType
} from '../render-page/window-post-message-communicator/rendering-message'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { useTranslation } from 'react-i18next'
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'
import { useSendToRenderer } from '../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { setRendererStatus } from '../../redux/renderer-status/methods'

/**
 * Renders the current markdown content as a slideshow.
 */
export const SlideShowPageContent: React.FC = () => {
  const markdownContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  useTranslation()

  const slideOptions = useApplicationState((state) => state.noteDetails.frontmatter.slideOptions)
  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)
  useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_SLIDE_OPTIONS,
        slideOptions
      }),
      [slideOptions]
    ),
    rendererReady
  )

  return (
    <div className={'vh-100 vw-100'}>
      <RenderIframe
        frameClasses={'h-100 w-100'}
        markdownContentLines={markdownContentLines}
        rendererType={RendererType.SLIDESHOW}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
        onRendererStatusChange={setRendererStatus}
      />
    </div>
  )
}
