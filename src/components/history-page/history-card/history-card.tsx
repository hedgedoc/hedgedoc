/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import React, { useCallback, useMemo } from 'react'
import { Badge, Card } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { formatHistoryDate } from '../utils'
import styles from './history-card.module.scss'
import { useHistoryEntryTitle } from '../use-history-entry-title'
import { cypressId } from '../../../utils/cypress-attribute'
import Link from 'next/link'

export const HistoryCard: React.FC<HistoryEntryProps & HistoryEventHandlers> = ({
  entry,
  onPinClick,
  onRemoveClick,
  onDeleteClick
}) => {
  const onRemove = useCallback(() => {
    onRemoveClick(entry.identifier)
  }, [onRemoveClick, entry.identifier])

  const onDelete = useCallback(() => {
    onDeleteClick(entry.identifier)
  }, [onDeleteClick, entry.identifier])

  const entryTitle = useHistoryEntryTitle(entry)

  const tags = useMemo(
    () =>
      entry.tags.map((tag) => (
        <Badge variant={'dark'} className={'mr-1 mb-1'} key={tag}>
          {tag}
        </Badge>
      )),
    [entry.tags]
  )

  const lastVisited = useMemo(() => formatHistoryDate(entry.lastVisited), [entry.lastVisited])

  return (
    <div className='p-2 col-xs-12 col-sm-6 col-md-6 col-lg-4' {...cypressId('history-card')}>
      <Card className={styles['card-min-height']} text={'dark'} bg={'light'}>
        <Card.Body className='p-2 d-flex flex-row justify-content-between'>
          <div className={'d-flex flex-column'}>
            <PinButton isDark={false} isPinned={entry.pinStatus} onPinClick={() => onPinClick(entry.identifier)} />
          </div>
          <Link href={`/n/${entry.identifier}`}>
            <a className='text-decoration-none flex-fill text-dark'>
              <div className={'d-flex flex-column justify-content-between'}>
                <Card.Title className='m-0 mt-1dot5' {...cypressId('history-entry-title')}>
                  {entryTitle}
                </Card.Title>
                <div>
                  <div className='text-black-50 mt-2'>
                    <ForkAwesomeIcon icon='clock-o' /> {DateTime.fromISO(entry.lastVisited).toRelative()}
                    <br />
                    {lastVisited}
                  </div>
                  <div className={`${styles['card-footer-min-height']} p-0`}>{tags}</div>
                </div>
              </div>
            </a>
          </Link>
          <div className={'d-flex flex-column'}>
            <EntryMenu
              id={entry.identifier}
              title={entry.title}
              origin={entry.origin}
              isDark={false}
              onRemove={onRemove}
              onDelete={onDelete}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
