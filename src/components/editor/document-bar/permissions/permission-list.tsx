/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { ReactElement, useState } from 'react'
import { Button, FormControl, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { Principal } from './permission-modal'

export interface PermissionListProps {
  list: Principal[]
  identifier: (entry: Principal) => ReactElement
  changeEditMode: (id: Principal['id'], canEdit: Principal['canEdit']) => void
  removeEntry: (id: Principal['id']) => void
  createEntry: (name: Principal['name']) => void
  editI18nKey: string
  viewI18nKey: string
  removeI18nKey: string
  addI18nKey: string
}

export enum EditMode {
  VIEW,
  EDIT
}

export const PermissionList: React.FC<PermissionListProps> = ({ list, identifier, changeEditMode, removeEntry, createEntry, editI18nKey, viewI18nKey, removeI18nKey, addI18nKey }) => {
  const { t } = useTranslation()
  const [newEntry, setNewEntry] = useState('')

  const addEntry = () => {
    createEntry(newEntry)
    setNewEntry('')
  }

  return (
    <ul className={'list-group'}>
      {list.map(entry => (
        <li key={entry.id} className={'list-group-item d-flex flex-row justify-content-between align-items-center'}>
          {identifier(entry)}
          <div>
            <Button
              variant='light'
              className={'text-danger mr-2'}
              title={t(removeI18nKey, { name: entry.name })}
              onClick={() => removeEntry(entry.id)}
            >
              <ForkAwesomeIcon icon={'times'}/>
            </Button>
            <ToggleButtonGroup
              type='radio'
              name='edit-mode'
              value={entry.canEdit ? EditMode.EDIT : EditMode.VIEW}
              onChange={(value: EditMode) => changeEditMode(entry.id, value === EditMode.EDIT)}
            >
              <ToggleButton
                title={ t(viewI18nKey, { name: entry.name })}
                variant={'light'}
                className={'text-secondary'}
                value={EditMode.VIEW}
              >
                <ForkAwesomeIcon icon='eye'/>
              </ToggleButton>
              <ToggleButton
                title={t(editI18nKey, { name: entry.name })}
                variant={'light'}
                className={'text-secondary'}
                value={EditMode.EDIT}
              >
                <ForkAwesomeIcon icon='pencil'/>
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </li>
      ))}
      <li className={'list-group-item'}>
        <form onSubmit={event => {
          event.preventDefault()
          addEntry()
        }}>
          <InputGroup className={'mr-1 mb-1'}>
            <FormControl
              value={newEntry}
              placeholder={t(addI18nKey)}
              aria-label={t(addI18nKey)}
              onChange={event => setNewEntry(event.currentTarget.value)}
            />
            <Button
              variant='light'
              className={'text-secondary ml-2'}
              title={t(addI18nKey)}
              onClick={addEntry}
            >
              <ForkAwesomeIcon icon={'plus'}/>
            </Button>
          </InputGroup>
        </form>
      </li>
    </ul>
  )
}
