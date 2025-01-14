/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { type MouseEvent, useMemo } from 'react'
import { Badge, Card } from 'react-bootstrap'
import { DateTime } from 'luxon'
import { BookmarkStarFill as IconPinned } from 'react-bootstrap-icons'
import styles from './pinned-note-card.module.css'
import { useCallback } from 'react'
import { NoteTypeIcon } from '../../common/note-type-icon/note-type-icon'
import type { NoteType } from '@hedgedoc/commons'
import { UiIcon } from '../../common/icons/ui-icon'
import Link from 'next/link'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { useRouter } from 'next/navigation'

export interface NoteCardProps {
  title: string
  id: string
  type: NoteType
  lastVisited: string
  created: string
  pinned: boolean
  tags: string[]
  primaryAddress: string
}

export const PinnedNoteCard: React.FC<NoteCardProps> = ({ title, id, lastVisited, type, primaryAddress, tags }) => {
  const router = useRouter()
  const labelTag = useTranslatedText('explore.filters.byTag')
  const labelUnpinNote = useTranslatedText('explore.pinnedNotes.unpin')
  const lastVisitedString = useMemo(() => DateTime.fromISO(lastVisited).toRelative(), [lastVisited])
  // const createdString = DateTime.fromISO(created).toFormat('DDDD T')
  const onClickUnpin = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      alert(`UnFav ${id}`)
    },
    [id]
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

  const tagsChips = useMemo(() => {
    return tags.map((tag) => (
      <Badge key={tag} bg={'secondary'} pill={true} className={'me-1'} onClick={onClickTag(tag)} title={labelTag}>
        {tag}
      </Badge>
    ))
  }, [tags, onClickTag, labelTag])

  return (
    <li className={'d-block'}>
      <Card className={`${styles.card}`} as={Link} href={`/n/${primaryAddress}`}>
        <Card.Body>
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
          {tagsChips}
        </Card.Body>
      </Card>
    </li>
  )
}
