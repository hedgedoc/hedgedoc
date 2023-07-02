'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteIdProps } from '../../../../components/common/note-loading-boundary/note-loading-boundary'
import { NoteLoadingBoundary } from '../../../../components/common/note-loading-boundary/note-loading-boundary'
import { DocumentReadOnlyPageContent } from '../../../../components/document-read-only-page/document-read-only-page-content'
import { useNoteAndAppTitle } from '../../../../components/editor-page/head-meta-properties/use-note-and-app-title'
import { EditorToRendererCommunicatorContextProvider } from '../../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { NextPage } from 'next'
import React from 'react'

interface PageParams {
  params: NoteIdProps
}

/**
 * Renders a page that contains only the rendered document without an editor or realtime updates.
 */
const DocumentReadOnlyPage: NextPage<PageParams> = ({ params }) => {
  useNoteAndAppTitle()

  return (
    <EditorToRendererCommunicatorContextProvider>
      <NoteLoadingBoundary noteId={params.noteId}>
        <DocumentReadOnlyPageContent />
      </NoteLoadingBoundary>
    </EditorToRendererCommunicatorContextProvider>
  )
}

export default DocumentReadOnlyPage
