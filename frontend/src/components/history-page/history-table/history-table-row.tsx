/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressAttribute, cypressId } from '../../../utils/cypress-attribute'
import { EntryMenu } from '../entry-menu/entry-menu'
import type { HistoryEntryProps, HistoryEventHandlers } from '../history-content/history-content'
import { PinButton } from '../pin-button/pin-button'
import { useHistoryEntryTitle } from '../use-history-entry-title'
import { formatHistoryDate } from '../utils'
import Link from 'next/link'
import React, { useCallback } from 'react'
import { Badge } from 'react-bootstrap'

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

  const onDeleteNote = useCallback(
    (keepMedia: boolean) => {
      onDeleteNoteClick(entry.identifier, keepMedia)
    },
    [onDeleteNoteClick, entry.identifier]
  )

  return (
    <tr {...cypressAttribute('entry-title', entryTitle)}>
      <td>
        <Link href={`/n/${entry.identifier}`} className='text-secondary' {...cypressId('history-entry-title')}>
          {entryTitle}
        </Link>
      </td>
      <td>{formatHistoryDate(entry.lastVisitedAt)}</td>
      <td>
        {entry.tags.map((tag) => (
          <Badge className={'me-1 mb-1'} key={tag}>
            {tag}
          </Badge>
        ))}
      </td>
      <td>
        <div className={'d-flex align-items-start justify-content-center'}>
          <PinButton isDark={true} isPinned={entry.pinStatus} onPinClick={onPinEntry} className={'mb-1 me-1'} />
          <EntryMenu
            id={entry.identifier}
            title={entryTitle}
            origin={entry.origin}
            noteOwner={entry.owner}
            onRemoveFromHistory={onEntryRemove}
            onDeleteNote={onDeleteNote}
          />
        </div>
      </td>
    </tr>
  )
}
