/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import React, { useCallback } from 'react'
import { Badge, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { formatHistoryDate } from '../utils'
import './history-card.scss'

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

  return (
    <div className='p-2 col-xs-12 col-sm-6 col-md-6 col-lg-4'>
      <Card className='card-min-height' text={'dark'} bg={'light'}>
        <Card.Body className='p-2 d-flex flex-row justify-content-between'>
          <div className={'d-flex flex-column'}>
            <PinButton isDark={false} isPinned={entry.pinStatus} onPinClick={() => onPinClick(entry.identifier)} />
          </div>
          <Link to={`/n/${entry.identifier}`} className='text-decoration-none flex-fill text-dark'>
            <div className={'d-flex flex-column justify-content-between'}>
              <Card.Title className='m-0 mt-1dot5'>{entry.title}</Card.Title>
              <div>
                <div className='text-black-50 mt-2'>
                  <ForkAwesomeIcon icon='clock-o' /> {DateTime.fromISO(entry.lastVisited).toRelative()}
                  <br />
                  {formatHistoryDate(entry.lastVisited)}
                </div>
                <div className={'card-footer-min-height p-0'}>
                  {entry.tags.map((tag) => (
                    <Badge variant={'dark'} className={'mr-1 mb-1'} key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
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
