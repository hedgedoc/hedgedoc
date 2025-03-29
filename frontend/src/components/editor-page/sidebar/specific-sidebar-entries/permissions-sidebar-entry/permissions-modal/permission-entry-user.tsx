/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { removeUserPermission, setUserPermission } from '../../../../../../api/permissions'
import { getUserInfo } from '../../../../../../api/users'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionEntryButtons, PermissionType } from './permission-entry-buttons'
import type { NoteUserPermissionEntryDto } from '@hedgedoc/commons'
import { GuestAccess, SpecialGroup } from '@hedgedoc/commons'
import React, { useCallback, useMemo } from 'react'
import { useAsync } from 'react-use'
import { PermissionInconsistentAlert } from './permission-inconsistent-alert'
import { useGetSpecialPermissions } from './hooks/use-get-special-permissions'
import { AsyncLoadingBoundary } from '../../../../../common/async-loading-boundary/async-loading-boundary'
import { UserAvatar } from '../../../../../common/user-avatar/user-avatar'

export interface PermissionEntryUserProps {
  entry: NoteUserPermissionEntryDto
}

/**
 * Permission entry for a user that can be set to read-only or writeable and can be removed.
 *
 * @param entry The permission entry.
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionEntryUser: React.FC<PermissionEntryUserProps & PermissionDisabledProps> = ({
  entry,
  disabled
}) => {
  const noteId = useApplicationState((state) => state.noteDetails?.primaryAddress)
  const { showErrorNotification } = useUiNotifications()
  const { [SpecialGroup.EVERYONE]: everyonePermission, [SpecialGroup.LOGGED_IN]: loggedInPermission } =
    useGetSpecialPermissions()

  const permissionInconsistent = useMemo(
    () =>
      (!!everyonePermission && everyonePermission.canEdit && !entry.canEdit) ||
      (!!loggedInPermission && loggedInPermission.canEdit && !entry.canEdit),
    [everyonePermission, loggedInPermission, entry]
  )

  const onRemoveEntry = useCallback(() => {
    if (!noteId) {
      return
    }
    removeUserPermission(noteId, entry.username)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, entry.username, showErrorNotification])

  const onSetEntryReadOnly = useCallback(() => {
    if (!noteId) {
      return
    }
    setUserPermission(noteId, entry.username, false)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, entry.username, showErrorNotification])

  const onSetEntryWriteable = useCallback(() => {
    if (!noteId) {
      return
    }
    setUserPermission(noteId, entry.username, true)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, entry.username, showErrorNotification])

  const { value, loading, error } = useAsync(async () => {
    return await getUserInfo(entry.username)
  }, [entry.username])

  if (!value) {
    return <></>
  }

  return (
    <AsyncLoadingBoundary loading={loading} error={error} componentName={'PermissionEntryUser'}>
      <li className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
        <UserAvatar user={value} />
        <div className={'d-flex flex-row align-items-center'}>
          <PermissionInconsistentAlert show={permissionInconsistent ?? false} />
          <PermissionEntryButtons
            type={PermissionType.USER}
            currentSetting={entry.canEdit ? GuestAccess.WRITE : GuestAccess.READ}
            name={value.displayName}
            onSetReadOnly={onSetEntryReadOnly}
            onSetWriteable={onSetEntryWriteable}
            onRemove={onRemoveEntry}
            disabled={disabled}
          />
        </div>
      </li>
    </AsyncLoadingBoundary>
  )
}
