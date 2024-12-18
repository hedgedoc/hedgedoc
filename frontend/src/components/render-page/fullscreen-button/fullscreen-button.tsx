/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './fullscreen-button.module.scss'
import React, { useMemo } from 'react'
import {
  ArrowsFullscreen as IconArrowsFullscreen,
  CollectionPlay as IconCollectionPlay,
  Pencil as IconPencil
} from 'react-bootstrap-icons'
import Link from 'next/link'
import { UiIcon } from '../../common/icons/ui-icon'
import { Button } from 'react-bootstrap'
import { useNoteLinks } from '../../../hooks/common/use-note-links'
import { NotePageType, useGetNotePageType } from '../../../hooks/common/use-get-note-page-type'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { NoteType } from '@hedgedoc/commons'

/**
 * Renders a button hovering over the parent.
 * When clicking it, you either get the read-only view or the presentation mode depending on the type of note you currently view.
 */
export const FullscreenButton: React.FC = () => {
  const noteLinks = useNoteLinks()
  const pageType = useGetNotePageType()
  const noteFrontmatter = useApplicationState((state) => state.noteDetails.frontmatter)

  const { correctLink, icon } = useMemo(() => {
    if (!noteFrontmatter) {
      return {}
    }
    switch (pageType) {
      case NotePageType.EDITOR:
        switch (noteFrontmatter.type) {
          case NoteType.DOCUMENT:
            return {
              correctLink: noteLinks[NotePageType.READ_ONLY],
              icon: IconArrowsFullscreen
            }
          case NoteType.SLIDE:
          default:
            return {
              correctLink: noteLinks[NotePageType.PRESENTATION],
              icon: IconCollectionPlay
            }
        }
      case NotePageType.READ_ONLY:
      default:
        return {
          correctLink: noteLinks[NotePageType.EDITOR],
          icon: IconPencil
        }
    }
  }, [noteLinks, pageType, noteFrontmatter])

  if (pageType === NotePageType.PRESENTATION || !correctLink || !icon) {
    return null
  }

  return (
    <Link href={correctLink} passHref={true} target={'_blank'} className={styles['fullscreen-button']}>
      <Button variant={'secondary'}>
        <UiIcon icon={icon} />
      </Button>
    </Link>
  )
}
