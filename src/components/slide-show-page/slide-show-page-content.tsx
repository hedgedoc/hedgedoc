/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { useTranslation } from 'react-i18next'
import { useSendFrontmatterInfoFromReduxToRenderer } from '../editor-page/renderer-pane/hooks/use-send-frontmatter-info-from-redux-to-renderer'
import { useNoteMarkdownContentWithoutFrontmatter } from '../../hooks/common/use-note-markdown-content-without-frontmatter'

export const SlideShowPageContent: React.FC = () => {
  const markdownContent = useNoteMarkdownContentWithoutFrontmatter()
  useTranslation()
  useSendFrontmatterInfoFromReduxToRenderer()

  return (
    <div className={'vh-100 vw-100'}>
      <RenderIframe
        frameClasses={'h-100 w-100'}
        markdownContent={markdownContent}
        rendererType={RendererType.SLIDESHOW}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
      />
    </div>
  )
}
