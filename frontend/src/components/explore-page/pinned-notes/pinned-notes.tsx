/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useMemo } from 'react'
import type { NoteCardProps } from './pinned-note-card'
import { PinnedNoteCard } from './pinned-note-card'
import { Trans, useTranslation } from 'react-i18next'
import { NoteType } from '@hedgedoc/commons'

const mockListPinnedNotes: NoteCardProps[] = [
  {
    id: '1',
    title: 'othermo Backend / Fullstack Dev',
    type: NoteType.DOCUMENT,
    pinned: true,
    lastVisited: new Date(2025, 0, 2, 14, 0, 0).toISOString(),
    created: new Date(2025, 0, 1, 12, 0, 0).toISOString(),
    tags: ['Arbeit', 'Ausschreibung'],
    primaryAddress: 'othermo'
  },
  {
    id: '2',
    title: 'HedgeDoc e.V.',
    type: NoteType.DOCUMENT,
    pinned: false,
    lastVisited: new Date(2025, 0, 13, 14, 0, 0).toISOString(),
    created: new Date(2025, 0, 12, 12, 0, 0).toISOString(),
    tags: ['HedgeDoc', 'Verein'],
    primaryAddress: 'ev'
  },
  {
    id: '3',
    title: 'Sister projects of HedgeDoc for the future',
    type: NoteType.DOCUMENT,
    pinned: false,
    lastVisited: new Date(2025, 0, 13, 14, 0, 0).toISOString(),
    created: new Date(2025, 0, 12, 12, 0, 0).toISOString(),
    tags: ['HedgeDoc', 'Funny'],
    primaryAddress: 'sister-projects'
  },
  {
    id: '4',
    title: 'HedgeDoc Keynote',
    type: NoteType.SLIDE,
    pinned: false,
    lastVisited: new Date(2025, 0, 13, 14, 0, 0).toISOString(),
    created: new Date(2025, 0, 12, 12, 0, 0).toISOString(),
    tags: [],
    primaryAddress: 'keynote'
  },
  {
    id: '5',
    title: 'KIF-Admin KIF 47,5',
    type: NoteType.DOCUMENT,
    pinned: false,
    lastVisited: new Date(2020, 2, 13, 14, 0, 0).toISOString(),
    created: new Date(2019, 10, 12, 12, 0, 0).toISOString(),
    tags: ['KIF-Admin', 'KIF 47,5'],
    primaryAddress: '5'
  },
  {
    id: '6',
    title: 'kif.rocks vs WifiOnICE/Bahn WLAN',
    type: NoteType.DOCUMENT,
    pinned: false,
    lastVisited: new Date(2020, 0, 13, 14, 0, 0).toISOString(),
    created: new Date(2020, 0, 12, 12, 0, 0).toISOString(),
    tags: ['Privat', 'Blogpost'],
    primaryAddress: 'wifionice'
  }
]

export const PinnedNotes: React.FC = () => {
  useTranslation()

  const cards = useMemo(() => {
    return mockListPinnedNotes.map((note: NoteCardProps) => <PinnedNoteCard key={note.id} {...note} />)
  }, [])

  return (
    <Fragment>
      <h2 className={'mb-2'}>
        <Trans i18nKey={'explore.pinnedNotes.title'} />
      </h2>
      <ul className={'d-block mx-2 py-2 mb-5 d-flex gap-2 w-100 overflow-x-auto'}>{cards}</ul>
    </Fragment>
  )
}
