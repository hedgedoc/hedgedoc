/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { getNote, Note } from '../../api/notes'
import { useApplyDarkMode } from '../../hooks/common/use-apply-dark-mode'
import { useDocumentTitle } from '../../hooks/common/use-document-title'
import { setDocumentContent } from '../../redux/document-content/methods'
import { extractNoteTitle } from '../common/document-title/note-title-extractor'
import { MotdBanner } from '../common/motd-banner/motd-banner'
import { ShowIf } from '../common/show-if/show-if'
import { AppBar, AppBarMode } from '../editor/app-bar/app-bar'
import { DocumentRenderPane } from '../editor/document-renderer-pane/document-render-pane'
import { EditorPathParams } from '../editor/editor'
import { YAMLMetaData } from '../editor/yaml-metadata/yaml-metadata'
import { DocumentInfobar } from './document-infobar'

export const PadViewOnly: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<EditorPathParams>()
  const untitledNote = t('editor.untitledNote')
  const [documentTitle, setDocumentTitle] = useState(untitledNote)
  const [noteData, setNoteData] = useState<Note>()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const noteMetadata = useRef<YAMLMetaData>()
  const firstHeading = useRef<string>()

  const updateDocumentTitle = useCallback(() => {
    const noteTitle = extractNoteTitle(untitledNote, noteMetadata.current, firstHeading.current)
    setDocumentTitle(noteTitle)
  }, [untitledNote])

  const onFirstHeadingChange = useCallback((newFirstHeading: string | undefined) => {
    firstHeading.current = newFirstHeading
    updateDocumentTitle()
  }, [updateDocumentTitle])

  const onMetadataChange = useCallback((metaData: YAMLMetaData | undefined) => {
    noteMetadata.current = metaData
    updateDocumentTitle()
  }, [updateDocumentTitle])

  useEffect(() => {
    getNote(id)
      .then(note => {
        setNoteData(note)
        setDocumentContent(note.content)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  useApplyDarkMode()
  useDocumentTitle(documentTitle)

  return (
    <div className={'d-flex flex-column mvh-100 bg-light'}>
      <MotdBanner/>
      <AppBar mode={AppBarMode.BASIC}/>
      <div className={'container'}>
        <ShowIf condition={error}>
          <Alert variant={'danger'} className={'my-2'}>
            <b><Trans i18nKey={'views.readOnly.error.title'}/></b>
            <br/>
            <Trans i18nKey={'views.readOnly.error.description'}/>
          </Alert>
        </ShowIf>
        <ShowIf condition={loading}>
          <Alert variant={'info'} className={'my-2'}>
            <Trans i18nKey={'views.readOnly.loading'}/>
          </Alert>
        </ShowIf>
      </div>
      <ShowIf condition={!error && !loading}>
        { /* TODO set editable and created author properly */ }
        <DocumentInfobar
          changedAuthor={noteData?.lastChange.userId ?? ''}
          changedTime={noteData?.lastChange.timestamp ?? 0}
          createdAuthor={'Test'}
          createdTime={noteData?.createtime ?? 0}
          editable={true}
          noteId={id}
          viewCount={noteData?.viewcount ?? 0}
        />
        <DocumentRenderPane
          onFirstHeadingChange={onFirstHeadingChange}
          onMetadataChange={onMetadataChange}
          onTaskCheckedChange={() => false}
        />
      </ShowIf>
    </div>
  )
}
