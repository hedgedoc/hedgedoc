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
import { useRouter } from 'next/navigation'
import { setPinnedState } from '../../../api/me'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { NoteTags } from '../note-tags/note-tags'
import { formatChangedAt } from '../../../utils/format-date'
import type { NoteExploreEntryInterface } from '@hedgedoc/commons'

export const PinnedNoteCard: React.FC<NoteExploreEntryInterface> = ({
  title,
  lastChangedAt,
  type,
  primaryAlias,
  tags
}) => {
  const { showErrorNotification } = useUiNotifications()
  const router = useRouter()
  const labelTag = useTranslatedText('explore.filters.byTag')
  const labelUnpinNote = useTranslatedText('explore.pinnedNotes.unpin')
  const lastVisitedString = useMemo(() => formatChangedAt(lastChangedAt), [lastChangedAt])
  const onClickUnpin = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      setPinnedState(primaryAlias, false).catch(
        showErrorNotification('explore.pinnedNotes.unpinError', { name: primaryAlias })
      )
    },
    [primaryAlias, showErrorNotification]
  )

  const onClickTag = useCallback(
    (tag: string) => {
      return (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        router.push(`?search=tag:${tag}`)
      }
    },
    [router]
  )

  return (
    <Card className={`${styles.card}`} as={Link} href={`/n/${primaryAlias}`}>
      <Card.Body className={`${styles.cardBody}`}>
        <div onClick={onClickUnpin} title={labelUnpinNote}>
          <UiIcon icon={IconPinned} size={1.5} className={`${styles.bookmark}`} />
          <div className={`${styles.star}`} />
        </div>
        <Card.Title className={`${styles.title}`}>
          <NoteTypeIcon noteType={type} />
          <span className={`${styles.titleText}`} title={title}>
            {title}
          </span>
        </Card.Title>
        <Card.Subtitle className='mb-2 text-muted'>{lastVisitedString}</Card.Subtitle>
        <div>
          <NoteTags tags={tags} onClickTag={onClickTag} hoverLabel={labelTag} />
        </div>
      </Card.Body>
    </Card>
  )
}
