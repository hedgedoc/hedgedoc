/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './fullscreen-button.module.scss'
import React from 'react'
import {
  ArrowsFullscreen as IconArrowsFullscreen,
  CollectionPlay as IconCollectionPlay,
  type Icon,
  Pencil as IconPencil
} from 'react-bootstrap-icons'
import Link from 'next/link'
import { UiIcon } from '../../common/icons/ui-icon'
import { Button } from 'react-bootstrap'
import { useNoteLinks } from '../../../hooks/common/use-note-links'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { NoteType } from '@hedgedoc/commons'
import { LinkType } from '../../editor-page/sidebar/specific-sidebar-entries/share-note-sidebar-entry/share-modal/note-url-field'

interface FullscreenButtonProps {
  linkToEditor: boolean
}

/**
 * Renders a button hovering over the parent.
 * When clicking it, you either get the read-only view or the presentation mode depending on the type of note you currently view.
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ linkToEditor }) => {
  const noteLinks = useNoteLinks()
  const noteType = useApplicationState((state) => state.noteDetails.frontmatter.type)

  if (!noteType) {
    return null
  }

  let correctLink: string | null
  let icon: Icon | null

  if (linkToEditor) {
    correctLink = noteLinks[LinkType.EDITOR]
    icon = IconPencil
  } else {
    switch (noteType) {
      case NoteType.SLIDE:
        correctLink = noteLinks[LinkType.SLIDESHOW]
        icon = IconCollectionPlay
        break
      case NoteType.DOCUMENT:
      default:
        correctLink = noteLinks[LinkType.DOCUMENT]
        icon = IconArrowsFullscreen
    }
  }

  return (
    <Link href={correctLink} passHref={true} target={'_blank'} className={styles['fullscreen-button']}>
      <Button variant={'secondary'}>
        <UiIcon icon={icon} />
      </Button>
    </Link>
  )
}
