/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../hooks/common/use-application-state'
import { NoteInfoLineCreatedAt } from '../editor-page/sidebar/specific-sidebar-entries/note-info-sidebar-menu/note-info-line/note-info-line-created-at'
import { NoteInfoLineUpdatedBy } from '../editor-page/sidebar/specific-sidebar-entries/note-info-sidebar-menu/note-info-line/note-info-line-updated-by'
import styles from './document-infobar.module.scss'
import React from 'react'
import { Trans } from 'react-i18next'

/**
 * Renders an info bar with metadata about the current note.
 */
export const DocumentInfobar: React.FC = () => {
  const noteDetails = useApplicationState((state) => state.noteDetails)

  if (noteDetails === null) {
    return null
  }

  return (
    <div className={`d-flex flex-row my-3 ${styles['document-infobar']}`}>
      <div className={'col-md'}>&nbsp;</div>
      <div className={'d-flex flex-fill'}>
        <NoteInfoLineCreatedAt />
        <NoteInfoLineUpdatedBy />
        <span className={'ms-auto'}>
          {noteDetails.viewCount} <Trans i18nKey={'views.readOnly.viewCount'} />
        </span>
      </div>
      <div className={'col-md'}>&nbsp;</div>
    </div>
  )
}
