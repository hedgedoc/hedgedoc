'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteIdProps } from '../../../../components/common/note-loading-boundary/note-loading-boundary'
import { NoteLoadingBoundary } from '../../../../components/common/note-loading-boundary/note-loading-boundary'
import { EditorPageContent } from '../../../../components/editor-page/editor-page-content'
import { EditorToRendererCommunicatorContextProvider } from '../../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { NextPage } from 'next'
import React from 'react'

interface PageParams {
  params: NoteIdProps
}

/**
 * Renders a page that is used by the user to edit markdown notes. It contains the editor and a renderer.
 */
const EditorPage: NextPage<PageParams> = ({ params }) => {
  return (
    <NoteLoadingBoundary noteId={params.noteId}>
      <EditorToRendererCommunicatorContextProvider>
        <EditorPageContent />
      </EditorToRendererCommunicatorContextProvider>
    </NoteLoadingBoundary>
  )
}

/*
 TODO: implement these in generateMetadata. We need these only in SSR.
  See https://github.com/hedgedoc/hedgedoc/issues/4766

 But its problematic because we dont get the opengraph meta data via API.

 <NoteAndAppTitleHead />
 <OpengraphHead />
 <LicenseLinkHead />

 export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
 if (!params.noteId) {
 return {}
 }
 const note = await getNote(params.noteId, getBaseUrls().editor)
 return {
 title: `HedgeDoc - ${ note.metadata.title }`
 description: note.metadata.description
 }
 }
 */

export default EditorPage
