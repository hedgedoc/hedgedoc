/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from '../../../hooks/dark-mode/use-dark-mode-state'
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { useHistoryEntryTitle } from '../use-history-entry-title'
import { formatHistoryDate } from '../utils'
import styles from './history-card.module.scss'
import { DateTime } from 'luxon'
import Link from 'next/link'
import React, { useCallback, useMemo } from 'react'
import { Badge, Card } from 'react-bootstrap'
import { Clock as IconClock } from 'react-bootstrap-icons'

/**
 * Renders a history entry as a card.
 *
 * @param entry The history entry.
 * @param onPinClick Callback that is fired when the pinning button was clicked.
 * @param onRemoveEntryClick Callback that is fired when the entry removal button was clicked.
 * @param onDeleteNoteClick Callback that is fired when the note deletion button was clicked.
 */
export const HistoryCard: React.FC<HistoryEntryProps & HistoryEventHandlers> = ({
  entry,
  onPinClick,
  onRemoveEntryClick,
  onDeleteNoteClick
}) => {
  const onRemoveEntry = useCallback(() => {
    onRemoveEntryClick(entry.identifier)
  }, [onRemoveEntryClick, entry.identifier])

  const onDeleteNote = useCallback(
    (keepMedia: boolean) => {
      onDeleteNoteClick(entry.identifier, keepMedia)
    },
    [onDeleteNoteClick, entry.identifier]
  )

  const onPinEntry = useCallback(() => {
    onPinClick(entry.identifier)
  }, [onPinClick, entry.identifier])

  const entryTitle = useHistoryEntryTitle(entry)

  const darkModeState = useDarkModeState()

  const tags = useMemo(
    () =>
      entry.tags.map((tag) => {
        return (
          <Badge className={'bg-secondary text-light me-1 mb-1'} key={tag}>
            {tag}
          </Badge>
        )
      }),
    [entry.tags]
  )
  const lastVisited = useMemo(() => formatHistoryDate(entry.lastVisitedAt), [entry.lastVisitedAt])

  return (
    <div
      className='p-2 col-xs-12 col-sm-6 col-md-6 col-lg-4'
      {...cypressId('history-card')}
      {...cypressAttribute('card-title', entryTitle)}>
      <Card className={`${styles['card-min-height']}`} bg={darkModeState ? 'dark' : 'light'}>
        <Card.Body className='p-2 d-flex flex-row justify-content-between'>
          <div className={'d-flex flex-column'}>
            <PinButton isDark={false} isPinned={entry.pinStatus} onPinClick={onPinEntry} />
          </div>
          <Link href={`/n/${entry.identifier}`} className='text-decoration-none text-body-emphasis flex-fill'>
            <div className={'d-flex flex-column justify-content-between'}>
              <Card.Title className='m-0 mt-1dot5' {...cypressId('history-entry-title')}>
                {entryTitle}
              </Card.Title>
              <div>
                <div className='mt-2'>
                  <UiIcon icon={IconClock} /> {DateTime.fromISO(entry.lastVisitedAt).toRelative()}
                  <br />
                  {lastVisited}
                </div>
                <div className={`${styles['card-footer-min-height']} p-0`}>{tags}</div>
              </div>
            </div>
          </Link>
          <div className={'d-flex flex-column'}>
            <EntryMenu
              id={entry.identifier}
              title={entryTitle}
              origin={entry.origin}
              onRemoveFromHistory={onRemoveEntry}
              onDeleteNote={onDeleteNote}
              noteOwner={entry.owner}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
