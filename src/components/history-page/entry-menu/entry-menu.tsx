/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { HistoryEntryOrigin } from '../history-page'
import { DeleteNoteItem } from './delete-note-item'
import './entry-menu.scss'
import { RemoveNoteEntryItem } from './remove-note-entry-item'

export interface EntryMenuProps {
  id: string;
  title: string
  location: HistoryEntryOrigin
  isDark: boolean;
  onRemove: () => void
  onDelete: () => void
  className?: string
}

export const EntryMenu: React.FC<EntryMenuProps> = ({ id, title, location, isDark, onRemove, onDelete, className }) => {
  useTranslation()

  return (
    <Dropdown className={`d-inline-flex ${className || ''}`}>
      <Dropdown.Toggle variant={isDark ? 'secondary' : 'light'} id={`dropdown-card-${id}`} className='no-arrow history-menu d-inline-flex align-items-center'>
        <ForkAwesomeIcon icon="ellipsis-v" fixedWidth={true}/>
      </Dropdown.Toggle>

      <Dropdown.Menu>

        <Dropdown.Header>
          <Trans i18nKey="landing.history.menu.recentNotes"/>
        </Dropdown.Header>

        <ShowIf condition={location === HistoryEntryOrigin.LOCAL}>
          <Dropdown.Item disabled>
            <ForkAwesomeIcon icon="laptop" fixedWidth={true} className="mx-2"/>
            <Trans i18nKey="landing.history.menu.entryLocal"/>
          </Dropdown.Item>
        </ShowIf>
        <ShowIf condition={location === HistoryEntryOrigin.REMOTE}>
          <Dropdown.Item disabled>
            <ForkAwesomeIcon icon="cloud" fixedWidth={true} className="mx-2"/>
            <Trans i18nKey="landing.history.menu.entryRemote"/>
          </Dropdown.Item>
        </ShowIf>
        <RemoveNoteEntryItem onConfirm={onRemove} noteTitle={title} />

        <Dropdown.Divider/>

        <DeleteNoteItem onConfirm={onDelete} noteTitle={title} />
      </Dropdown.Menu>
    </Dropdown>
  )
}
