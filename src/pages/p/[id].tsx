/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { useLoadNoteFromServer } from '../../components/editor-page/hooks/useLoadNoteFromServer'
import { ShowIf } from '../../components/common/show-if/show-if'
import { EditorToRendererCommunicatorContextProvider } from '../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { SlideShowPageContent } from '../../components/slide-show-page/slide-show-page-content'
import { NoteAndAppTitleHead } from '../../components/layout/note-and-app-title-head'

export const SlideShowPage: React.FC = () => {
  const [error, loading] = useLoadNoteFromServer()

  return (
    <Fragment>
      <NoteAndAppTitleHead />
      <EditorToRendererCommunicatorContextProvider>
        <ShowIf condition={!error && !loading}>
          <SlideShowPageContent />
        </ShowIf>
      </EditorToRendererCommunicatorContextProvider>
    </Fragment>
  )
}

export default SlideShowPage
