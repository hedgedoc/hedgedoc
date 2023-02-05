/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../hooks/common/use-application-state'
import { InternalLink } from '../common/links/internal-link'
import { ShowIf } from '../common/show-if/show-if'
import { NoteInfoLineCreated } from '../editor-page/document-bar/note-info/note-info-line-created'
import { NoteInfoLineUpdated } from '../editor-page/document-bar/note-info/note-info-line-updated'
import styles from './document-infobar.module.scss'
import React from 'react'
import { Pencil as IconPencil } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders an info bar with metadata about the current note.
 */
export const DocumentInfobar: React.FC = () => {
  const { t } = useTranslation()
  const noteDetails = useApplicationState((state) => state.noteDetails)

  // TODO Check permissions ("writability") of note and show edit link depending on that.
  return (
    <div className={`d-flex flex-row my-3 ${styles['document-infobar']}`}>
      <div className={'col-md'}>&nbsp;</div>
      <div className={'d-flex flex-fill'}>
        <div className={'d-flex flex-column'}>
          <NoteInfoLineCreated />
          <NoteInfoLineUpdated />
          <hr />
        </div>
        <span className={'ms-auto'}>
          {noteDetails.viewCount} <Trans i18nKey={'views.readOnly.viewCount'} />
          <ShowIf condition={true}>
            <InternalLink
              text={''}
              href={`/n/${noteDetails.primaryAddress}`}
              icon={IconPencil}
              className={'text-primary text-decoration-none mx-1'}
              title={t('views.readOnly.editNote') ?? undefined}
            />
          </ShowIf>
        </span>
      </div>
      <div className={'col-md'}>&nbsp;</div>
    </div>
  )
}
