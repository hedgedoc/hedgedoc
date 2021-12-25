/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useLoadNoteFromServer } from '../../components/editor-page/hooks/useLoadNoteFromServer'
import { ShowIf } from '../../components/common/show-if/show-if'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { SlideShowPageContent } from '../../components/slide-show-page/slide-show-page-content'
import { useDocumentTitleWithNoteTitle } from '../../hooks/common/use-document-title-with-note-title'

export const SlideShowPage: React.FC = () => {
  const [error, loading] = useLoadNoteFromServer()
  useDocumentTitleWithNoteTitle()

  return (
    <EditorToRendererCommunicatorContextProvider>
      <ShowIf condition={!error && !loading}>
        <SlideShowPageContent />
      </ShowIf>
    </EditorToRendererCommunicatorContextProvider>
  )
}

export default SlideShowPage
