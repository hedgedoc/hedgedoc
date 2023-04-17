/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'
import { setRendererStatus } from '../../redux/renderer-status/methods'
import { RenderIframe } from '../editor-page/renderer-pane/render-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { DocumentInfobar } from './document-infobar'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Renders the read-only version of a note with a header bar that contains information about the note.
 */
export const DocumentReadOnlyPageContent: React.FC = () => {
  useTranslation()

  const markdownContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()

  // TODO Change todo values with real ones as soon as the backend is ready.
  return (
    <Fragment>
      <DocumentInfobar />
      <RenderIframe
        frameClasses={'flex-fill h-100 w-100'}
        markdownContentLines={markdownContentLines}
        rendererType={RendererType.DOCUMENT}
        onRendererStatusChange={setRendererStatus}
      />
    </Fragment>
  )
}
