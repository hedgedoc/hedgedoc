/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { MotdModal } from '../../components/common/motd-modal/motd-modal'
import { ShowIf } from '../../components/common/show-if/show-if'
import { AppBar, AppBarMode } from '../../components/editor-page/app-bar/app-bar'
import { useLoadNoteFromServer } from '../../components/editor-page/hooks/useLoadNoteFromServer'
import { ErrorWhileLoadingNoteAlert } from '../../components/document-read-only-page/ErrorWhileLoadingNoteAlert'
import { LoadingNoteAlert } from '../../components/document-read-only-page/LoadingNoteAlert'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { UiNotifications } from '../../components/notifications/ui-notifications'
import { DocumentReadOnlyPageContent } from '../../components/document-read-only-page/document-read-only-page-content'
import { NoteAndAppTitleHead } from '../../components/layout/note-and-app-title-head'

/**
 * Renders a page that contains only the rendered document without an editor or realtime updates.
 */
export const DocumentReadOnlyPage: React.FC = () => {
  useApplyDarkMode()
  const [error, loading] = useLoadNoteFromServer()
  return (
    <EditorToRendererCommunicatorContextProvider>
      <NoteAndAppTitleHead />
      <UiNotifications />
      <MotdModal />
      <div className={'d-flex flex-column mvh-100 bg-light'}>
        <AppBar mode={AppBarMode.BASIC} />
        <div className={'container'}>
          <ErrorWhileLoadingNoteAlert show={error} />
          <LoadingNoteAlert show={loading} />
        </div>
        <ShowIf condition={!error && !loading}>
          <DocumentReadOnlyPageContent />
        </ShowIf>
      </div>
    </EditorToRendererCommunicatorContextProvider>
  )
}

export default DocumentReadOnlyPage
