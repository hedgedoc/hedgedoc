/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { Badge } from 'react-bootstrap'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { formatHistoryDate } from '../utils'
import { useHistoryEntryTitle } from '../use-history-entry-title'
import { cypressId } from '../../../utils/cypress-attribute'
import Link from 'next/link'

/**
 * Renders a history entry as a table row.
 *
 * @param entry The history entry.
 * @param onPinClick Callback that is fired when the pinning button was clicked.
 * @param onRemoveEntryClick Callback that is fired when the entry removal button was clicked.
 * @param onDeleteNoteClick Callback that is fired when the note deletion button was clicked.
 */
export const HistoryTableRow: React.FC<HistoryEntryProps & HistoryEventHandlers> = ({
  entry,
  onPinClick,
  onRemoveEntryClick,
  onDeleteNoteClick
}) => {
  const entryTitle = useHistoryEntryTitle(entry)

  const onPinEntry = useCallback(() => {
    onPinClick(entry.identifier)
  }, [onPinClick, entry.identifier])

  const onEntryRemove = useCallback(() => {
    onRemoveEntryClick(entry.identifier)
  }, [onRemoveEntryClick, entry.identifier])

  const onDeleteNote = useCallback(() => {
    onDeleteNoteClick(entry.identifier)
  }, [onDeleteNoteClick, entry.identifier])

  return (
    <tr>
      <td>
        <Link href={`/n/${entry.identifier}`}>
          <a className='text-light' {...cypressId('history-entry-title')}>
            {entryTitle}
          </a>
        </Link>
      </td>
      <td>{formatHistoryDate(entry.lastVisitedAt)}</td>
      <td>
        {entry.tags.map((tag) => (
          <Badge className={'bg-light me-1 mb-1'} key={tag}>
            {tag}
          </Badge>
        ))}
      </td>
      <td>
        <PinButton isDark={true} isPinned={entry.pinStatus} onPinClick={onPinEntry} className={'mb-1 me-1'} />
        <EntryMenu
          id={entry.identifier}
          title={entryTitle}
          origin={entry.origin}
          onRemoveFromHistory={onEntryRemove}
          onDeleteNote={onDeleteNote}
        />
      </td>
    </tr>
  )
}
