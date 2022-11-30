/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteLoadingBoundary } from '../../components/common/note-loading-boundary/note-loading-boundary'
import { EditorPageContent } from '../../components/editor-page/editor-page-content'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { NextPage } from 'next'
import React from 'react'

/**
 * Renders a page that is used by the user to edit markdown notes. It contains the editor and a renderer.
 */
export const EditorPage: NextPage = () => {
  return (
    <NoteLoadingBoundary>
      <EditorToRendererCommunicatorContextProvider>
        <EditorPageContent />
      </EditorToRendererCommunicatorContextProvider>
    </NoteLoadingBoundary>
  )
}

export default EditorPage
