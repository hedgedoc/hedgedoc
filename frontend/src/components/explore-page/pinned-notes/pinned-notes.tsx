'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PinnedNoteCard } from './pinned-note-card'
import { Trans, useTranslation } from 'react-i18next'
import { Caret } from './caret'
import styles from './pinned-notes.module.css'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { Container } from 'react-bootstrap'
import { concatCssClasses } from '../../../utils/concat-css-classes'

/**
 * Renders the section for the user's pinned notes on the explore page.
 */
export const PinnedNotes: React.FC = () => {
  useTranslation()
  const scrollboxRef = useRef<HTMLDivElement>(null)
  const [enableScrollLeft, setEnableScrollLeft] = useState(false)
  const [enableScrollRight, setEnableScrollRight] = useState(false)
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

  const pinnedNoteCardsPresent = useMemo(() => pinnedNoteCards && pinnedNoteCards.length > 0, [pinnedNoteCards])

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
  }, [pinnedNoteCards])

  return (
    <div className={styles.container}>
      <Container>
        <h2 className={styles.pinnedNotesHeading}>
          <Trans i18nKey={'explore.pinnedNotes.title'} />
        </h2>
        <div
          className={concatCssClasses('flex-row gap-2 align-items-center mb-4', {
            'd-none': !pinnedNoteCardsPresent,
            'd-flex': pinnedNoteCardsPresent
          })}>
          <Caret active={enableScrollLeft} left={true} onClick={scrollToLeftClick} />
          <div className={styles.scrollbox} ref={scrollboxRef}>
            {pinnedNoteCards}
          </div>
          <Caret active={enableScrollRight} left={false} onClick={scrollToRightClick} />
        </div>
        <div className={concatCssClasses('mb-4', { 'd-none': pinnedNoteCardsPresent })}>
          <p className={'fs-4'}>
            <Trans i18nKey={'explore.pinnedNotes.empty'} />
          </p>
        </div>
      </Container>
    </div>
  )
}
