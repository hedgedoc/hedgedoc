/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { MotdModal } from '../../components/common/motd-modal/motd-modal'
import { AppBar, AppBarMode } from '../../components/editor-page/app-bar/app-bar'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { DocumentReadOnlyPageContent } from '../../components/document-read-only-page/document-read-only-page-content'
import { NoteAndAppTitleHead } from '../../components/layout/note-and-app-title-head'
import { NoteLoadingBoundary } from '../../components/common/note-loading-boundary/note-loading-boundary'

/**
 * Renders a page that contains only the rendered document without an editor or realtime updates.
 */
export const DocumentReadOnlyPage: React.FC = () => {
  useApplyDarkMode()
  return (
    <EditorToRendererCommunicatorContextProvider>
      <NoteLoadingBoundary>
        <NoteAndAppTitleHead />
        <MotdModal />
        <div className={'d-flex flex-column mvh-100 bg-light'}>
          <AppBar mode={AppBarMode.BASIC} />
          <DocumentReadOnlyPageContent />
        </div>
      </NoteLoadingBoundary>
    </EditorToRendererCommunicatorContextProvider>
  )
}

export default DocumentReadOnlyPage
