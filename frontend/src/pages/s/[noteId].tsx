/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteLoadingBoundary } from '../../components/common/note-loading-boundary/note-loading-boundary'
import { DocumentReadOnlyPageContent } from '../../components/document-read-only-page/document-read-only-page-content'
import { HeadMetaProperties } from '../../components/editor-page/head-meta-properties/head-meta-properties'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { MotdModal } from '../../components/global-dialogs/motd-modal/motd-modal'
import { BaseAppBar } from '../../components/layout/app-bar/base-app-bar'
import { useApplyDarkModeStyle } from '../../hooks/dark-mode/use-apply-dark-mode-style'
import { useSaveDarkModePreferenceToLocalStorage } from '../../hooks/dark-mode/use-save-dark-mode-preference-to-local-storage'
import React from 'react'

/**
 * Renders a page that contains only the rendered document without an editor or realtime updates.
 */
export const DocumentReadOnlyPage: React.FC = () => {
  useApplyDarkModeStyle()
  useSaveDarkModePreferenceToLocalStorage()

  return (
    <EditorToRendererCommunicatorContextProvider>
      <NoteLoadingBoundary>
        <HeadMetaProperties />
        <MotdModal />
        <div className={'d-flex flex-column mvh-100'}>
          <BaseAppBar />
          <DocumentReadOnlyPageContent />
        </div>
      </NoteLoadingBoundary>
    </EditorToRendererCommunicatorContextProvider>
  )
}

export default DocumentReadOnlyPage
