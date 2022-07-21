/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { useTranslation } from 'react-i18next'
import { useSendFrontmatterInfoFromReduxToRenderer } from '../editor-page/renderer-pane/hooks/use-send-frontmatter-info-from-redux-to-renderer'
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'

/**
 * Renders the current markdown content as a slideshow.
 */
export const SlideShowPageContent: React.FC = () => {
  const markdownContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  useTranslation()
  useSendFrontmatterInfoFromReduxToRenderer()

  return (
    <div className={'vh-100 vw-100'}>
      <RenderIframe
        frameClasses={'h-100 w-100'}
        markdownContentLines={markdownContentLines}
        rendererType={RendererType.SLIDESHOW}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
      />
    </div>
  )
}
