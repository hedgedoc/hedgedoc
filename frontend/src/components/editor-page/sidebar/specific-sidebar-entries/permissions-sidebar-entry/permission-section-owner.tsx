/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setNoteOwner } from '../../../../../api/permissions'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionOwnerChange } from './permission-owner-change'
import { PermissionOwnerInfo } from './permission-owner-info'
import React, { useCallback, useState } from 'react'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { SidebarMenuInfoEntry } from '../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import { PersonBadge as IconPersonBadge } from 'react-bootstrap-icons'
import { UserAvatarForUsername } from '../../../../common/user-avatar/user-avatar-for-username'

/**
 * Section in the permissions modal for managing the owner of a note.
 *
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionSectionOwner: React.FC<PermissionDisabledProps> = ({ disabled }) => {
  const noteOwner = useApplicationState((state) => state.noteDetails?.permissions.owner)
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const [changeOwner, setChangeOwner] = useState(false)
  const { showErrorNotificationBuilder } = useUiNotifications()

  const onSetChangeOwner = useCallback(() => {
    setChangeOwner(true)
  }, [])

  const onOwnerChange = useCallback(
    (newOwner: string) => {
      if (!noteAlias) {
        return
      }
      setNoteOwner(noteAlias, newOwner)
        .then((updatedPermissions) => {
          setNotePermissionsFromServer(updatedPermissions)
        })
        .catch(showErrorNotificationBuilder('editor.permissions.ownerChange.error'))
        .finally(() => {
          setChangeOwner(false)
        })
    },
    [noteAlias, showErrorNotificationBuilder]
  )
  const onCancel = useCallback(() => setChangeOwner(false), [])

  return (
    <SidebarMenuInfoEntry
      titleI18nKey={'editor.permissions.owner'}
      icon={IconPersonBadge}
      prefixComponent={
        !changeOwner ? (
          <UserAvatarForUsername username={noteOwner} showName={false} additionalClasses={'mx-2'} />
        ) : undefined
      }
      {...cypressId('permission-owner-name')}>
      <div className={'d-flex flex-row align-items-center justify-content-between'}>
        {changeOwner ? (
          <PermissionOwnerChange onConfirmOwnerChange={onOwnerChange} onCancelOwnerChange={onCancel} />
        ) : (
          <PermissionOwnerInfo onEditOwner={onSetChangeOwner} disabled={disabled} noteOwner={noteOwner} />
        )}
      </div>
    </SidebarMenuInfoEntry>
  )
}
