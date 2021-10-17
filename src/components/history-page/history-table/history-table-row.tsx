/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { formatHistoryDate } from '../utils'

export const HistoryTableRow: React.FC<HistoryEntryProps & HistoryEventHandlers> = ({
  entry,
  onPinClick,
  onRemoveClick,
  onDeleteClick
}) => {
  return (
    <tr>
      <td>
        <Link to={`/n/${entry.identifier}`} className='text-light'>
          {entry.title}
        </Link>
      </td>
      <td>{formatHistoryDate(entry.lastVisited)}</td>
      <td>
        {entry.tags.map((tag) => (
          <Badge variant={'light'} className={'mr-1 mb-1'} key={tag}>
            {tag}
          </Badge>
        ))}
      </td>
      <td>
        <PinButton
          isDark={true}
          isPinned={entry.pinStatus}
          onPinClick={() => onPinClick(entry.identifier)}
          className={'mb-1 mr-1'}
        />
        <EntryMenu
          id={entry.identifier}
          title={entry.title}
          origin={entry.origin}
          isDark={true}
          onRemove={() => onRemoveClick(entry.identifier)}
          onDelete={() => onDeleteClick(entry.identifier)}
        />
      </td>
    </tr>
  )
}
