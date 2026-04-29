/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'
import { setRendererStatus } from '../../redux/renderer-status/methods'
import { RendererIframe } from '../common/renderer-iframe/renderer-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { DocumentInfobar } from './document-infobar'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { FullscreenButton } from '../render-page/fullscreen-button/fullscreen-button'
import { CommunicatorImageLightbox } from '../markdown-renderer/extensions/image/communicator-image-lightbox'
import { ExtensionEventEmitterProvider } from '../markdown-renderer/hooks/use-extension-event-emitter'

/**
 * Renders the read-only version of a note with a header bar that contains information about the note.
 */
export const DocumentReadOnlyPageContent: React.FC = () => {
  useTranslation()

  const markdownContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  return (
    <Fragment>
      <DocumentInfobar />
      <ExtensionEventEmitterProvider>
        <CommunicatorImageLightbox />
        <RendererIframe
          frameClasses={'flex-fill h-100 w-100'}
          markdownContentLines={markdownContentLines}
          rendererType={RendererType.DOCUMENT}
          onRendererStatusChange={setRendererStatus}
        />
      </ExtensionEventEmitterProvider>
      <FullscreenButton linkToEditor={true} />
    </Fragment>
  )
}
