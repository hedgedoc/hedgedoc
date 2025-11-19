/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PinnedNoteCard } from './pinned-note-card'
import { Trans, useTranslation } from 'react-i18next'
import { Caret } from './caret'
import styles from './pinned-notes.module.css'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export const PinnedNotes: React.FC = () => {
  useTranslation()
  const scrollboxRef = useRef<HTMLDivElement>(null)
  const [enableScrollLeft, setEnableScrollLeft] = useState(false)
  const [enableScrollRight, setEnableScrollRight] = useState(true)
  const pinnedNotes = useApplicationState((state) => state.pinnedNotes)

  const scrollToLeftClick = useCallback(() => {
    if (!scrollboxRef.current) {
      return
    }
    scrollboxRef.current.scrollBy({
      left: -400,
      behavior: 'smooth'
    })
  }, [])
  const scrollToRightClick = useCallback(() => {
    if (!scrollboxRef.current) {
      return
    }
    scrollboxRef.current.scrollBy({
      left: 400,
      behavior: 'smooth'
    })
  }, [])

  const pinnedNoteCards = useMemo(() => {
    if (!pinnedNotes) {
      return null
    }
    return Object.values(pinnedNotes).map((note) => <PinnedNoteCard key={note.primaryAlias} {...note} />)
  }, [pinnedNotes])

  useEffect(() => {
    if (!scrollboxRef.current) {
      return
    }
    const scrollbox = scrollboxRef.current
    const scrollHandler = () => {
      setEnableScrollLeft(scrollbox.scrollLeft > 0)
      setEnableScrollRight(Math.ceil(scrollbox.scrollLeft + scrollbox.clientWidth) < scrollbox.scrollWidth)
    }
    scrollbox.addEventListener('scroll', scrollHandler)
    scrollHandler()
    return () => {
      scrollbox.removeEventListener('scroll', scrollHandler)
    }
  }, [])

  return (
    <Fragment>
      <h2 className={'mb-2'}>
        <Trans i18nKey={'explore.pinnedNotes.title'} />
      </h2>
      <div className={'d-flex flex-row gap-2 align-items-center mb-4'}>
        {pinnedNoteCards && pinnedNoteCards.length > 0 ? (
          <Fragment>
            <Caret active={enableScrollLeft} left={true} onClick={scrollToLeftClick} />
            <div className={styles.scrollbox} ref={scrollboxRef}>
              {pinnedNoteCards}
            </div>
            <Caret active={enableScrollRight} left={false} onClick={scrollToRightClick} />
          </Fragment>
        ) : (
          <p className={'fs-4'}>
            <Trans i18nKey={'explore.pinnedNotes.empty'} />
          </p>
        )}
      </div>
    </Fragment>
  )
}
