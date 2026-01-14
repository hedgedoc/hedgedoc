/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { type MouseEvent, useMemo } from 'react'
import { Card } from 'react-bootstrap'
import { BookmarkStarFill as IconPinned } from 'react-bootstrap-icons'
import styles from './pinned-note-card.module.scss'
import { useCallback } from 'react'
import { NoteTypeIcon } from '../../common/note-type-icon/note-type-icon'
import { UiIcon } from '../../common/icons/ui-icon'
import Link from 'next/link'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { formatChangedAt } from '../../../utils/format-date'
import type { NoteExploreEntryInterface } from '@hedgedoc/commons'
import { unpinNote } from '../../../redux/pinned-notes/methods'
import { Trans } from 'react-i18next'

/**
 * Renders a pinned note card.
 *
 * @param title The title of the note.
 * @param lastChangedAt The last time the note was changed as ISO string
 * @param type The type of the note, e.g. slide or document.
 * @param primaryAlias The primary alias of the note.
 */
export const PinnedNoteCard: React.FC<NoteExploreEntryInterface> = ({ title, lastChangedAt, type, primaryAlias }) => {
  const { showErrorNotificationBuilder } = useUiNotifications()
  const labelUnpinNote = useTranslatedText('explore.pinnedNotes.unpin')
  const fallbackUntitled = useTranslatedText('editor.untitledNote')
  const lastChangedString = useMemo(() => formatChangedAt(lastChangedAt), [lastChangedAt])

  const onClickUnpin = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      unpinNote(primaryAlias).catch(
        showErrorNotificationBuilder('explore.pinnedNotes.unpinError', { name: primaryAlias })
      )
    },
    [primaryAlias, showErrorNotificationBuilder]
  )

  return (
    <Card className={`${styles.card}`} as={Link} href={`/n/${primaryAlias}`}>
      <Card.Body className={`${styles.cardBody}`}>
        <div className={'d-flex align-items-center'}>
          <div onClick={onClickUnpin} title={labelUnpinNote}>
            <UiIcon icon={IconPinned} size={1.5} className={`${styles.bookmark}`} />
            <div className={`${styles.star}`} />
          </div>
          <span className={'me-2'}>
            <NoteTypeIcon noteType={type} size={3} />
          </span>
          <div className={'flex-grow-1'}>
            <span className={`${styles.title} d-inline-block text-truncate`}>
              {title !== '' ? title : <i className={'fst-italic'}>{fallbackUntitled}</i>}
            </span>
            <br />
            <span className={'text-muted'}>
              <Trans i18nKey={'explore.timestamps.lastUpdated'} values={{ timeAgo: lastChangedString }} />
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
