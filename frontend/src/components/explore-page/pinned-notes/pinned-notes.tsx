/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import type { NoteCardProps } from './pinned-note-card'
import { PinnedNoteCard } from './pinned-note-card'
import { Trans, useTranslation } from 'react-i18next'
import { NoteType } from '@hedgedoc/commons'

import styles from './pinned-note-card.module.scss'
import { UiIcon } from '../../common/icons/ui-icon'
import { Caret } from './caret'

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

const perChunk = 3

export const PinnedNotes: React.FC = () => {
  useTranslation()
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const chunkedNotes: NoteCardProps[][] = useMemo(() => {
    return mockListPinnedNotes.reduce((resultArray: NoteCardProps[][], item, index) => {
      const chunkIndex = Math.floor(index / perChunk)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, [])
  }, [])

  const carouselItems = useMemo(() => {
    return chunkedNotes.map((chunk: NoteCardProps[], index) => (
      <div key={index} className={`d-flex flex-row gap-2 ${currentIndex == index ? '' : 'd-none'}`}>
        {chunk.map((note: NoteCardProps) => (
          <PinnedNoteCard key={note.id} {...note} />
        ))}
      </div>
    ))
  }, [chunkedNotes, currentIndex])

  const leftClick = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0))
  }, [setCurrentIndex])
  const rightClick = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, chunkedNotes.length - 1))
  }, [setCurrentIndex, chunkedNotes])

  return (
    <Fragment>
      <h2 className={'mb-2'}>
        <Trans i18nKey={'explore.pinnedNotes.title'} />
      </h2>
      <div className={'d-flex flex-row gap-2 align-items-center mb-4'}>
        <Caret active={currentIndex != 0} left={true} onClick={leftClick} />
        {carouselItems}
        <Caret active={currentIndex != chunkedNotes.length - 1} left={false} onClick={rightClick} />
      </div>
    </Fragment>
  )
}
