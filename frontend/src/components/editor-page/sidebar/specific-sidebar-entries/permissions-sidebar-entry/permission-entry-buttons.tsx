/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'
import type { PermissionDisabledProps } from './permission-disabled.prop'
import { PermissionLevel } from '@hedgedoc/commons'
import React, { useMemo } from 'react'
import { ToggleButtonGroup } from 'react-bootstrap'
import { Eye as IconEye, Pencil as IconPencil, X as IconX } from 'react-bootstrap-icons'
import { IconButton } from '../../../../common/icon-button/icon-button'

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
  currentSetting: PermissionLevel
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
 * @param disabled If the user is not the owner, functionality is disabled.
 */
export const PermissionEntryButtons: React.FC<PermissionEntryButtonsProps & PermissionDisabledProps> = ({
  name,
  type,
  currentSetting,
  onSetReadOnly,
  onSetWriteable,
  onRemove,
  disabled
}) => {
  const i18nKeys: PermissionEntryButtonI18nKeys = useMemo(() => {
    switch (type) {
      case PermissionType.USER:
        return {
          remove: 'editor.permissions.removeUser',
          setReadOnly: 'editor.permissions.viewOnlyUser',
          setWriteable: 'editor.permissions.editUser'
        }
      case PermissionType.GROUP:
        return {
          remove: 'editor.permissions.removeGroup',
          setReadOnly: 'editor.permissions.viewOnlyGroup',
          setWriteable: 'editor.permissions.editGroup'
        }
    }
  }, [type])

  const translateOptions = useMemo(() => ({ name }), [name])
  const removeTitle = useTranslatedText(i18nKeys.remove, translateOptions)
  const setReadOnlyTitle = useTranslatedText(i18nKeys.setReadOnly, translateOptions)
  const setWritableTitle = useTranslatedText(i18nKeys.setWriteable, translateOptions)

  return (
    <div>
      <ToggleButtonGroup className={'me-2'} type='radio' name='edit-mode' value={currentSetting}>
        <IconButton
          icon={IconEye}
          title={setReadOnlyTitle}
          variant={currentSetting === PermissionLevel.READ ? 'primary' : 'outline-primary'}
          onClick={onSetReadOnly}
          disabled={disabled}
          className={'p-1'}
        />
        <IconButton
          icon={IconPencil}
          title={setWritableTitle}
          variant={currentSetting === PermissionLevel.WRITE ? 'primary' : 'outline-primary'}
          onClick={onSetWriteable}
          disabled={disabled}
          className={'p-1'}
        />
      </ToggleButtonGroup>
      <IconButton
        icon={IconX}
        variant={'danger'}
        disabled={disabled}
        title={removeTitle}
        onClick={onRemove}
        className={'p-1'}
      />
    </div>
  )
}
