'use client'

/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteIdProps } from '../../../../components/common/note-loading-boundary/note-loading-boundary'
import { NoteLoadingBoundary } from '../../../../components/common/note-loading-boundary/note-loading-boundary'
import { useNoteAndAppTitle } from '../../../../components/editor-page/head-meta-properties/use-note-and-app-title'
import { EditorToRendererCommunicatorContextProvider } from '../../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { SlideShowPageContent } from '../../../../components/slide-show-page/slide-show-page-content'
import type { NextPage } from 'next'
import React from 'react'

interface PageParams {
  params: NoteIdProps
}

/**
 * Renders a page that is used by the user to hold a presentation. It contains the renderer for the presentation.
 */
const SlideShowPage: NextPage<PageParams> = ({ params }) => {
  useNoteAndAppTitle()

  return (
    <NoteLoadingBoundary noteId={params.noteId}>
      <EditorToRendererCommunicatorContextProvider>
        <SlideShowPageContent />
      </EditorToRendererCommunicatorContextProvider>
    </NoteLoadingBoundary>
  )
}

export default SlideShowPage
