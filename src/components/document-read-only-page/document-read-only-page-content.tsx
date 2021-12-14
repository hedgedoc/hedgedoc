/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { updateNoteTitleByFirstHeading } from '../../redux/note-details/methods'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { useSendFrontmatterInfoFromReduxToRenderer } from '../editor-page/renderer-pane/hooks/use-send-frontmatter-info-from-redux-to-renderer'
import { DocumentInfobar } from './document-infobar'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'

export const DocumentReadOnlyPageContent: React.FC = () => {
  useTranslation()

  const markdownContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  const noteDetails = useApplicationState((state) => state.noteDetails)
  useSendFrontmatterInfoFromReduxToRenderer()

  return (
    <Fragment>
      <DocumentInfobar
        changedAuthor={noteDetails.lastChange.username ?? ''}
        changedTime={noteDetails.lastChange.timestamp}
        createdAuthor={'Test'}
        createdTime={noteDetails.createTime}
        editable={true}
        noteId={noteDetails.id}
        viewCount={noteDetails.viewCount}
      />
      <RenderIframe
        frameClasses={'flex-fill h-100 w-100'}
        markdownContentLines={markdownContentLines}
        onFirstHeadingChange={updateNoteTitleByFirstHeading}
        rendererType={RendererType.DOCUMENT}
      />
    </Fragment>
  )
}
