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

interface NoteListEntryProps extends NoteExploreEntryInterface {
  isPinned: boolean
  showLastVisitedTime?: boolean
}

/**
 * Renders a single note entry in the notes list.
 *
 * @param primaryAlias The primary alias of the note.
 * @param title The title of the note.
 * @param tags A list of tags of the note.
 * @param type The type of the note, e.g. slide or document.
 * @param lastChangedAt ISO string of the last time the note was changed.
 * @param lastVisitedAt ISO string of the last time the note was visited, can be null if not visited yet.
 * @param owner The username of the owner of the note, can be null if the note is owned by a guest.
 * @param isPinned Whether the note is pinned to the current user's explore page or not.
 * @param showLastVisitedTime Whether to show the last visited time instead of the last changed time. Defaults to false.
 */
export const NoteListEntry: React.FC<NoteListEntryProps> = ({
  primaryAlias,
  title,
  tags,
  type,
  lastChangedAt,
  lastVisitedAt,
  owner,
  isPinned,
  showLastVisitedTime
}) => {
  useTranslation()
  const { showErrorNotification } = useUiNotifications()
  const currentUser = useApplicationState((state) => state.user)
  const fallbackUntitled = useTranslatedText('editor.untitledNote')
  const onClickDeleteNote = useCallback(
    (keepMedia: boolean) => {
      deleteNote(primaryAlias, keepMedia).catch(showErrorNotification('explore.notesList.deleteNoteError', { title }))
    },
    [title, primaryAlias, showErrorNotification]
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
    <div className={'border-top border-bottom py-3 d-flex align-items-center'}>
      <span className={'mx-2'}>
        <Link href={`/n/${primaryAlias}`}>
          <NoteTypeIcon noteType={type} size={3} />
        </Link>
      </span>
      <div className={'flex-grow-1'}>
        <Link href={`/n/${primaryAlias}`} className={'text-decoration-none'}>
          {title !== '' ? title : <i className={'fst-italic'}>{fallbackUntitled}</i>}
        </Link>
        {tags.length > 0 && <br />}
        <NoteTags tags={tags} />
      </div>
      <div className={'me-4'}>
        <UserAvatarForUsername username={owner} />
        <br />
        <small className={'text-muted float-end'}>
          <Trans i18nKey={relativeTime.key} values={{ timeAgo: relativeTime.value }} />
        </small>
      </div>
      <Dropdown>
        <Dropdown.Toggle variant={'secondary'} className={'no-arrow'}>
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
  )
}
