/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { EntryMenu } from '../entry-menu/entry-menu'
import { HistoryEntryProps } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { formatHistoryDate } from '../utils'

export const HistoryTableRow: React.FC<HistoryEntryProps> = ({ entry, onPinClick, onRemoveClick, onDeleteClick }) => {
  return (
    <tr>
      <td>
        <Link to={ `/n/${ entry.id }` } className="text-light">
          { entry.title }
        </Link>
      </td>
      <td>{ formatHistoryDate(entry.lastVisited) }</td>
      <td>
        {
          entry.tags.map((tag) => <Badge variant={ 'light' } className={ 'mr-1 mb-1' }
                                         key={ tag }>{ tag }</Badge>)
        }
      </td>
      <td>
        <PinButton isDark={ true } isPinned={ entry.pinned } onPinClick={ () => onPinClick(entry.id, entry.location) }
                   className={ 'mb-1 mr-1' }/>
        <EntryMenu
          id={ entry.id }
          title={ entry.title }
          location={ entry.location }
          isDark={ true }
          onRemove={ () => onRemoveClick(entry.id, entry.location) }
          onDelete={ () => onDeleteClick(entry.id, entry.location) }
        />
      </td>
    </tr>
  )
}
