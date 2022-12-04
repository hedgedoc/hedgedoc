/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { removeGroupPermission, setGroupPermission } from '../../../../api/permissions'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setNotePermissionsFromServer } from '../../../../redux/note-details/methods'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { AccessLevel, SpecialGroup } from './types'
import React, { useCallback, useMemo } from 'react'
import { Button, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface PermissionEntrySpecialGroupProps {
  level: AccessLevel
  type: SpecialGroup
}

/**
 * Permission entry that represents one of the built-in special groups.
 *
 * @param level The access level that is currently set for the group.
 * @param type The type of the special group. Must be either {@link SpecialGroup.EVERYONE} or {@link SpecialGroup.LOGGED_IN}.
 */
export const PermissionEntrySpecialGroup: React.FC<PermissionEntrySpecialGroupProps> = ({ level, type }) => {
  const noteId = useApplicationState((state) => state.noteDetails.primaryAddress)
  const { t } = useTranslation()
  const { showErrorNotification } = useUiNotifications()

  const onSetEntryReadOnly = useCallback(() => {
    setGroupPermission(noteId, type, false)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, showErrorNotification, type])

  const onSetEntryWriteable = useCallback(() => {
    setGroupPermission(noteId, type, true)
      .then((updatedPermissions) => {
        setNotePermissionsFromServer(updatedPermissions)
      })
      .catch(showErrorNotification('editor.modal.permissions.error'))
  }, [noteId, showErrorNotification, type])

  const onSetEntryDenied = useCallback(() => {
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

  return (
    <li className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
      <span>{name}</span>
      <div>
        <ToggleButtonGroup type='radio' name='edit-mode'>
          <Button
            title={t('editor.modal.permissions.denyGroup', { name }) ?? undefined}
            variant={level === AccessLevel.NONE ? 'secondary' : 'outline-secondary'}
            onClick={onSetEntryDenied}>
            <ForkAwesomeIcon icon={'ban'} />
          </Button>
          <Button
            title={t('editor.modal.permissions.viewOnlyGroup', { name }) ?? undefined}
            variant={level === AccessLevel.READ_ONLY ? 'secondary' : 'outline-secondary'}
            onClick={onSetEntryReadOnly}>
            <ForkAwesomeIcon icon={'eye'} />
          </Button>
          <Button
            title={t('editor.modal.permissions.editGroup', { name }) ?? undefined}
            variant={level === AccessLevel.WRITEABLE ? 'secondary' : 'outline-secondary'}
            onClick={() => onSetEntryWriteable}>
            <ForkAwesomeIcon icon={'pencil'} />
          </Button>
        </ToggleButtonGroup>
      </div>
    </li>
  )
}
