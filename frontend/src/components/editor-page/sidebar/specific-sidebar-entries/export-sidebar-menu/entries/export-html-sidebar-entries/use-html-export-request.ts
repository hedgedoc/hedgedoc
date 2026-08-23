/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useBaseUrl } from '../../../../../../../hooks/common/use-base-url'
import { useApplicationState } from '../../../../../../../hooks/common/use-application-state'
import { useEditorToRendererCommunicator } from '../../../../../render-context/editor-to-renderer-communicator-context-provider'
import { CommunicationMessageType } from '../../../../../../render-page/window-post-message-communicator/rendering-message'
import { useCallback } from 'react'
import { useNoteTitle } from '../../../../../../../hooks/common/use-note-title'

/**
 * Common hook to request the HTML export from the iframe and downloading the response HTML as a file
 *
 * @param withStyles true to request a HTML export with inlined images and stylesheets, false for unstyled HTML
 * @returns A onClick handler to use for a button to initialize the export
 */
export const useHtmlExportRequest = (withStyles: boolean) => {
  const baseUrl = useBaseUrl()
  const title = useNoteTitle()
  const primaryAlias = useApplicationState((state) => state.noteDetails.primaryAlias)
  const editorToRendererCommunicator = useEditorToRendererCommunicator()

  const rendererReady = useApplicationState((state) => state.rendererStatus.rendererReady)
  const onClick = useCallback(() => {
    if (rendererReady) {
      editorToRendererCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.EXPORT_HTML_REQUEST,
        noteUrl: `${baseUrl}n/${primaryAlias}`,
        noteTitle: title,
        withStyles
      })
    }
  }, [editorToRendererCommunicator, rendererReady, baseUrl, primaryAlias, withStyles, title])

  return {
    onClick
  }
}
