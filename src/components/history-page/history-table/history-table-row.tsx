/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Badge } from 'react-bootstrap'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { formatHistoryDate } from '../utils'
import { useHistoryEntryTitle } from '../use-history-entry-title'
import { cypressId } from '../../../utils/cypress-attribute'
import Link from 'next/link'

export const HistoryTableRow: React.FC<HistoryEntryProps & HistoryEventHandlers> = ({
  entry,
  onPinClick,
  onRemoveClick,
  onDeleteClick
}) => {
  const entryTitle = useHistoryEntryTitle(entry)
  return (
    <tr>
      <td>
        <Link href={`/n/${entry.identifier}`}>
          <a className='text-light' {...cypressId('history-entry-title')}>
            {entryTitle}
          </a>
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
          title={entryTitle}
          origin={entry.origin}
          isDark={true}
          onRemove={() => onRemoveClick(entry.identifier)}
          onDelete={() => onDeleteClick(entry.identifier)}
        />
      </td>
    </tr>
  )
}
