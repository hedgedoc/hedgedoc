/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react'
import { Trans } from 'react-i18next'
import { useEditorToRendererCommunicator } from '../../../../../render-context/editor-to-renderer-communicator-context-provider'
import { useEditorReceiveHandler } from '../../../../../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import { CommunicationMessageType } from '../../../../../../render-page/window-post-message-communicator/rendering-message'
import { useApplicationState } from '../../../../../../../hooks/common/use-application-state'
import { FiletypeHtml as IconFiletypeHtml } from 'react-bootstrap-icons'
import { useNoteFilename } from '../../../../../../../hooks/common/use-note-filename'
import { download } from '../../../../../../common/download/download'
import { SidebarButton } from '../../../../sidebar-button/sidebar-button'
import { useBaseUrl } from '../../../../../../../hooks/common/use-base-url'

/**
 * Editor sidebar entry for exporting the unstyled HTML content into a local file.
 * This works by sending a request to the iframe for retrieving and processing
 * the content and downloading the returned HTML.
 */
export const ExportUnstyledHtmlSidebarEntry: React.FC = () => {
  const baseUrl = useBaseUrl()
  const primaryAlias = useApplicationState((state) => state.noteDetails.primaryAlias)
  const fileName = useNoteFilename('html')
  const editorToRendererCommunicator = useEditorToRendererCommunicator()

  useEditorReceiveHandler(
    CommunicationMessageType.EXPORT_HTML_RESPONSE,
    useMemo(
      () =>
        ({ html }) =>
          download(html, fileName, 'text/html'),
      [fileName]
    )
  )

  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)
  const onClick = useCallback(() => {
    if (rendererReady) {
      editorToRendererCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.EXPORT_HTML_REQUEST,
        noteUrl: `${baseUrl}n/${primaryAlias}`
      })
    }
  }, [editorToRendererCommunicator, rendererReady, baseUrl, primaryAlias])

  return (
    <SidebarButton onClick={onClick} icon={IconFiletypeHtml}>
      <Trans i18nKey={'editor.export.unstyled-html'} />
    </SidebarButton>
  )
}
