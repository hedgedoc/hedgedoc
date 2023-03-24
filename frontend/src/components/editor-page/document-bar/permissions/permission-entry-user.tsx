/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteUserPermissionEntry } from '../../../../api/notes/types'
import { removeUserPermission, setUserPermission } from '../../../../api/permissions'
import { getUser } from '../../../../api/users'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../redux/note-details/methods'
import { ShowIf } from '../../../common/show-if/show-if'
import { UserAvatarForUser } from '../../../common/user-avatar/user-avatar-for-user'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { PermissionEntryButtons, PermissionType } from './permission-entry-buttons'
import { AccessLevel } from './types'
import React, { useCallback } from 'react'
import { useAsync } from 'react-use'

export interface PermissionEntryUserProps {
  entry: NoteUserPermissionEntry
}

/**
 * Permission entry for a user that can be set to read-only or writeable and can be removed.
 *
 * @param entry The permission entry.
 */
export const PermissionEntryUser: React.FC<PermissionEntryUserProps> = ({ entry }) => {
  const noteId = useApplicationState((state) => state.noteDetails.primaryAddress)
  const { showErrorNotification } = useUiNotifications()

  const onRemoveEntry = useCallback(() => {
    removeUserPermission(noteId, entry.username)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, entry.username, showErrorNotification])

  const onSetEntryReadOnly = useCallback(() => {
    setUserPermission(noteId, entry.username, false)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, entry.username, showErrorNotification])

  const onSetEntryWriteable = useCallback(() => {
    setUserPermission(noteId, entry.username, true)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, entry.username, showErrorNotification])

  const { value, loading, error } = useAsync(async () => {
    return await getUser(entry.username)
  }, [entry.username])

  if (!value) {
    return <></>
  }

  return (
    <ShowIf condition={!loading && !error}>
      <li className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
        <UserAvatarForUser user={value} />
        <PermissionEntryButtons
          type={PermissionType.USER}
          currentSetting={entry.canEdit ? AccessLevel.WRITEABLE : AccessLevel.READ_ONLY}
          name={value.displayName}
          onSetReadOnly={onSetEntryReadOnly}
          onSetWriteable={onSetEntryWriteable}
          onRemove={onRemoveEntry}
        />
      </li>
    </ShowIf>
  )
}
