'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { NoteTypeIcon } from '../../../common/note-type-icon/note-type-icon'
import { NoteTags } from '../../note-tags/note-tags'
import { Dropdown } from 'react-bootstrap'
import { UiIcon } from '../../../common/icons/ui-icon'
import { ThreeDotsVertical as IconThreeDotsVertical } from 'react-bootstrap-icons'
import { UserAvatarForUsername } from '../../../common/user-avatar/user-avatar-for-username'
import { DeleteNoteMenuEntry } from './delete-note-menu-entry'
import { formatChangedAt } from '../../../../utils/format-date'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { deleteNote } from '../../../../api/notes'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import type { NoteExploreEntryInterface } from '@hedgedoc/commons'
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import { Trans, useTranslation } from 'react-i18next'
import { PinNoteMenuEntry } from './pin-note-menu-entry'
import styles from '../../../components/explore-page/workspace/workspace.module.scss'

interface NoteListEntryProps extends NoteExploreEntryInterface {
  isPinned: boolean
  showLastVisitedTime?: boolean
  updateExplorePage: () => void
}

export const NoteListEntry: React.FC<NoteListEntryProps> = ({
  primaryAlias,
  title,
  tags,
  type,
  lastChangedAt,
  lastVisitedAt,
  owner,
  isPinned,
  showLastVisitedTime,
  updateExplorePage
}) => {
  useTranslation()
  const { showErrorNotificationBuilder } = useUiNotifications()
  const currentUser = useApplicationState((state) => state.user)
  const fallbackUntitled = useTranslatedText('editor.untitledNote')
  
  const onClickDeleteNote = useCallback(
    (keepMedia: boolean) => {
      deleteNote(primaryAlias, keepMedia)
        .then(updateExplorePage)
        .catch(showErrorNotificationBuilder('explore.notesList.deleteNoteError', { title }))
    },
    [title, primaryAlias, showErrorNotificationBuilder, updateExplorePage]
  )

  const relativeTime = useMemo(() => {
    if (showLastVisitedTime && lastVisitedAt) {
      return {
        key: 'explore.timestamps.lastVisited',
        value: formatChangedAt(lastVisitedAt)
      }
    }
    return {
      key: 'explore.timestamps.lastUpdated',
      value: formatChangedAt(lastChangedAt)
    }
  }, [showLastVisitedTime, lastVisitedAt, lastChangedAt])

  return (
    <div className={styles.noteCard}>
      <div className={styles.cardIcon}>
        <Link href={`/n/${primaryAlias}`}>
          <NoteTypeIcon noteType={type} size={3} />
        </Link>
      </div>
      
      <div className={styles.cardTitle}>
        <Link href={`/n/${primaryAlias}`} className={'text-decoration-none color-inherit'}>
          {title !== '' ? title : <i className={'fst-italic'}>{fallbackUntitled}</i>}
        </Link>
      </div>

      <div className={'mb-2'}>
        {tags.length > 0 && <NoteTags tags={tags} />}
      </div>

      <div className={styles.cardFooter}>
        <div className={'d-flex align-items-center gap-1'}>
          <UserAvatarForUsername username={owner} />
          <small className={'text-muted'}>
            <Trans i18nKey={relativeTime.key} values={{ timeAgo: relativeTime.value }} />
          </small>
        </div>
        
        <Dropdown>
          <Dropdown.Toggle variant={'secondary'} className={'no-arrow py-0 px-1'}>
            <UiIcon icon={IconThreeDotsVertical} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <DeleteNoteMenuEntry
              noteTitle={title}
              isOwner={owner !== null && currentUser?.username === owner}
              onConfirm={onClickDeleteNote}
            />
            <PinNoteMenuEntry noteAlias={primaryAlias} isPinned={isPinned} />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  )
}
