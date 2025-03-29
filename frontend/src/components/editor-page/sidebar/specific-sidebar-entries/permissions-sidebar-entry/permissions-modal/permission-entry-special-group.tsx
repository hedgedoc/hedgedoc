/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { removeGroupPermission, setGroupPermission } from '../../../../../../api/permissions'
import { useApplicationState } from '../../../../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../../../../hooks/common/use-translated-text'
import { setNotePermissionsFromServer } from '../../../../../../redux/note-details/methods'
import { IconButton } from '../../../../../common/icon-button/icon-button'
import { useUiNotifications } from '../../../../../notifications/ui-notification-boundary'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { GuestAccess, SpecialGroup } from '@hedgedoc/commons'
import React, { useCallback, useMemo } from 'react'
import { ToggleButtonGroup } from 'react-bootstrap'
import { Eye as IconEye, Pencil as IconPencil, SlashCircle as IconSlashCircle } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { PermissionInconsistentAlert } from './permission-inconsistent-alert'
import { cypressId } from '../../../../../../utils/cypress-attribute'

export interface PermissionEntrySpecialGroupProps {
  level: GuestAccess
  type: SpecialGroup
  inconsistent?: boolean
}

/**
 * Permission entry that represents one of the built-in special groups.
 *
 * @param level The access level that is currently set for the group.
 * @param type The type of the special group. Must be either {@link SpecialGroup.EVERYONE} or {@link SpecialGroup.LOGGED_IN}.
 * @param disabled If the user is not the owner, functionality is disabled.
 * @param inconsistent Whether to show the inconsistency alert icon or not
 */
export const PermissionEntrySpecialGroup: React.FC<PermissionEntrySpecialGroupProps & PermissionDisabledProps> = ({
  level,
  type,
  disabled,
  inconsistent
}) => {
  const noteId = useApplicationState((state) => state.noteDetails?.primaryAddress)
  const { t } = useTranslation()
  const { showErrorNotification } = useUiNotifications()

  const onSetEntryReadOnly = useCallback(() => {
    if (!noteId) {
      return
    }
    setGroupPermission(noteId, type, false)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, showErrorNotification, type])

  const onSetEntryWriteable = useCallback(() => {
    if (!noteId) {
      return
    }
    setGroupPermission(noteId, type, true)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, showErrorNotification, type])

  const onSetEntryDenied = useCallback(() => {
    if (!noteId) {
      return
    }
    removeGroupPermission(noteId, type)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, showErrorNotification, type])

  const name = useMemo(() => {
    switch (type) {
      case SpecialGroup.LOGGED_IN:
        return t('editor.modal.permissions.allLoggedInUser')
      case SpecialGroup.EVERYONE:
        return t('editor.modal.permissions.allUser')
    }
  }, [type, t])

  const translateOptions = useMemo(() => ({ name }), [name])
  const denyGroupText = useTranslatedText('editor.modal.permissions.denyGroup', translateOptions)
  const viewOnlyGroupText = useTranslatedText('editor.modal.permissions.viewOnlyGroup', translateOptions)
  const editGroupText = useTranslatedText('editor.modal.permissions.editGroup', translateOptions)

  return (
    <li className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
      <span>{name}</span>
      <div>
        <PermissionInconsistentAlert show={inconsistent ?? false} />
        <ToggleButtonGroup type='radio' name='edit-mode'>
          <IconButton
            icon={IconSlashCircle}
            title={denyGroupText}
            variant={level === GuestAccess.DENY ? 'secondary' : 'outline-secondary'}
            onClick={onSetEntryDenied}
            disabled={disabled}
            className={'p-1'}
            {...cypressId(`permission-setting-deny${type}`)}
          />
          <IconButton
            icon={IconEye}
            title={viewOnlyGroupText}
            variant={level === GuestAccess.READ ? 'secondary' : 'outline-secondary'}
            onClick={onSetEntryReadOnly}
            disabled={disabled}
            className={'p-1'}
            {...cypressId(`permission-setting-read${type}`)}
          />
          <IconButton
            icon={IconPencil}
            title={editGroupText}
            variant={level === GuestAccess.WRITE ? 'secondary' : 'outline-secondary'}
            onClick={onSetEntryWriteable}
            disabled={disabled}
            className={'p-1'}
            {...cypressId(`permission-setting-write${type}`)}
          />
        </ToggleButtonGroup>
      </div>
    </li>
  )
}
