/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { SlideShowPageContent } from '../../components/slide-show-page/slide-show-page-content'
import { NoteAndAppTitleHead } from '../../components/layout/note-and-app-title-head'
import { NoteLoadingBoundary } from '../../components/common/note-loading-boundary/note-loading-boundary'

export const SlideShowPage: React.FC = () => {
  return (
    <NoteLoadingBoundary>
      <NoteAndAppTitleHead />
      <EditorToRendererCommunicatorContextProvider>
        <SlideShowPageContent />
      </EditorToRendererCommunicatorContextProvider>
    </NoteLoadingBoundary>
  )
}

export default SlideShowPage
