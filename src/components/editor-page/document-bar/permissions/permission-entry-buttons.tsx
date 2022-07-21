/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react'
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { AccessLevel } from './types'
import { useTranslation } from 'react-i18next'

interface PermissionEntryButtonI18nKeys {
  remove: string
  setReadOnly: string
  setWriteable: string
}

export enum PermissionType {
  USER,
  GROUP
}

export interface PermissionEntryButtonsProps {
  type: PermissionType
  currentSetting: AccessLevel
  name: string
  onSetReadOnly: () => void
  onSetWriteable: () => void
  onRemove: () => void
}

/**
 * Buttons next to a user or group permission entry to change the permissions or remove the entry.
 *
 * @param name The name of the user or group.
 * @param type The type of the entry. Either {@link PermissionType.USER} or {@link PermissionType.GROUP}.
 * @param currentSetting How the permission is currently set.
 * @param onSetReadOnly Callback that is fired when the entry is changed to read-only permission.
 * @param onSetWriteable Callback that is fired when the entry is changed to writeable permission.
 * @param onRemove Callback that is fired when the entry is removed.
 */
export const PermissionEntryButtons: React.FC<PermissionEntryButtonsProps> = ({
  name,
  type,
  currentSetting,
  onSetReadOnly,
  onSetWriteable,
  onRemove
}) => {
  const { t } = useTranslation()

  const i18nKeys: PermissionEntryButtonI18nKeys = useMemo(() => {
    switch (type) {
      case PermissionType.USER:
        return {
          remove: 'editor.modal.permissions.removeUser',
          setReadOnly: 'editor.modal.permissions.viewOnlyUser',
          setWriteable: 'editor.modal.permissions.editUser'
        }
      case PermissionType.GROUP:
        return {
          remove: 'editor.modal.permissions.removeGroup',
          setReadOnly: 'editor.modal.permissions.viewOnlyGroup',
          setWriteable: 'editor.modal.permissions.editGroup'
        }
    }
  }, [type])

  return (
    <div>
      <Button variant='light' className={'text-danger mr-2'} title={t(i18nKeys.remove, { name })} onClick={onRemove}>
        <ForkAwesomeIcon icon={'times'} />
      </Button>
      <ToggleButtonGroup type='radio' name='edit-mode' value={currentSetting}>
        <ToggleButton
          title={t(i18nKeys.setReadOnly, { name })}
          variant={'light'}
          className={'text-secondary'}
          value={AccessLevel.READ_ONLY}
          onClick={onSetReadOnly}>
          <ForkAwesomeIcon icon='eye' />
        </ToggleButton>
        <ToggleButton
          title={t(i18nKeys.setWriteable, { name })}
          variant={'light'}
          className={'text-secondary'}
          value={AccessLevel.WRITEABLE}
          onClick={onSetWriteable}>
          <ForkAwesomeIcon icon='pencil' />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
}
