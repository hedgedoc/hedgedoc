/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { useNoteMarkdownContent } from '../../hooks/common/use-note-markdown-content'
import { useTranslation } from 'react-i18next'
import { useLoadNoteFromServer } from '../editor-page/hooks/useLoadNoteFromServer'
import { ShowIf } from '../common/show-if/show-if'
import { updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { useSendFrontmatterInfoFromReduxToRenderer } from '../editor-page/renderer-pane/hooks/use-send-frontmatter-info-from-redux-to-renderer'

export const SlideShowPage: React.FC = () => {
  const markdownContent = useNoteMarkdownContent()

  useTranslation()
  useSendFrontmatterInfoFromReduxToRenderer()

  const [error, loading] = useLoadNoteFromServer()

  return (
    <ShowIf condition={!error && !loading}>
      <div className={'vh-100 vw-100'}>
        <RenderIframe
          frameClasses={'h-100 w-100'}
          markdownContent={markdownContent}
          rendererType={RendererType.SLIDESHOW}
          onFirstHeadingChange={updateNoteTitleByFirstHeading}
        />
      </div>
    </ShowIf>
  )
}

export default SlideShowPage
