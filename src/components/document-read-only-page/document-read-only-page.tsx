/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { useDocumentTitleWithNoteTitle } from '../../hooks/common/use-document-title-with-note-title'
import { MotdModal } from '../common/motd-modal/motd-modal'
import { ShowIf } from '../common/show-if/show-if'
import { AppBar, AppBarMode } from '../editor-page/app-bar/app-bar'
import { useLoadNoteFromServer } from '../editor-page/hooks/useLoadNoteFromServer'
import { ErrorWhileLoadingNoteAlert } from './ErrorWhileLoadingNoteAlert'
import { LoadingNoteAlert } from './LoadingNoteAlert'
import { EditorToRendererCommunicatorContextProvider } from '../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { UiNotifications } from '../notifications/ui-notifications'
import { DocumentReadOnlyPageContent } from './document-read-only-page-content'

export const DocumentReadOnlyPage: React.FC = () => {
  useApplyDarkMode()
  useDocumentTitleWithNoteTitle()
  const [error, loading] = useLoadNoteFromServer()
  return (
    <EditorToRendererCommunicatorContextProvider>
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
