/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../hooks/common/use-application-state'
import { useTranslatedText } from '../../hooks/common/use-translated-text'
import { InternalLink } from '../common/links/internal-link'
import { NoteInfoLineCreatedAt } from '../editor-page/sidebar/specific-sidebar-entries/note-info-sidebar-menu/note-info-line/note-info-line-created-at'
import { NoteInfoLineUpdatedBy } from '../editor-page/sidebar/specific-sidebar-entries/note-info-sidebar-menu/note-info-line/note-info-line-updated-by'
import styles from './document-infobar.module.scss'
import React from 'react'
import { Pencil as IconPencil } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Renders an info bar with metadata about the current note.
 */
export const DocumentInfobar: React.FC = () => {
  const noteDetails = useApplicationState((state) => state.noteDetails)
  const linkTitle = useTranslatedText('views.readOnly.editNote')

  if (noteDetails === null) {
    return null
  }

  return (
    <div className={`d-flex flex-row my-3 ${styles['document-infobar']}`}>
      <div className={'col-md'}>&nbsp;</div>
      <div className={'d-flex flex-fill'}>
        <div className={'d-flex flex-column'}>
          <NoteInfoLineCreatedAt />
          <NoteInfoLineUpdatedBy />
          <hr />
        </div>
        <span className={'ms-auto'}>
          {noteDetails.viewCount} <Trans i18nKey={'views.readOnly.viewCount'} />
          <InternalLink
            text={''}
            href={`/n/${noteDetails.primaryAddress}`}
            icon={IconPencil}
            className={'text-primary text-decoration-none mx-1'}
            title={linkTitle}
          />
        </span>
      </div>
      <div className={'col-md'}>&nbsp;</div>
    </div>
  )
}
