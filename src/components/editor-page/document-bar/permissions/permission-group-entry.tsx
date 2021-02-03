/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'

export interface PermissionGroupEntryProps {
  title: string
  editMode: GroupMode
  onChangeEditMode: (newMode: GroupMode) => void
}

export enum GroupMode {
  NONE,
  VIEW,
  EDIT,
}

export const PermissionGroupEntry: React.FC<PermissionGroupEntryProps> = ({ title, editMode, onChangeEditMode }) => {
  const { t } = useTranslation()

  return (
    <li className={ 'list-group-item d-flex flex-row justify-content-between align-items-center' }>
      <Trans i18nKey={ title }/>
      <ToggleButtonGroup
        type='radio'
        name='edit-mode'
        value={ editMode }
        onChange={ onChangeEditMode }
      >
        <ToggleButton
          title={ t('editor.modal.permissions.denyGroup', { name: t(title) }) }
          variant={ 'light' }
          className={ 'text-secondary' }
          value={ GroupMode.NONE }
        >
          <ForkAwesomeIcon icon='ban'/>
        </ToggleButton>
        <ToggleButton
          title={ t('editor.modal.permissions.viewOnlyGroup', { name: t(title) }) }
          variant={ 'light' }
          className={ 'text-secondary' }
          value={ GroupMode.VIEW }
        >
          <ForkAwesomeIcon icon='eye'/>
        </ToggleButton>
        <ToggleButton
          title={ t('editor.modal.permissions.editGroup', { name: t(title) }) }
          variant={ 'light' }
          className={ 'text-secondary' }
          value={ GroupMode.EDIT }
        >
          <ForkAwesomeIcon icon='pencil'/>
        </ToggleButton>
      </ToggleButtonGroup>
    </li>
  )
}
