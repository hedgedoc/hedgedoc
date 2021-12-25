/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { DeleteNoteItem } from './delete-note-item'
import styles from './entry-menu.module.scss'
import { RemoveNoteEntryItem } from './remove-note-entry-item'
import { HistoryEntryOrigin } from '../../../redux/history/types'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'

export interface EntryMenuProps {
  id: string
  title: string
  origin: HistoryEntryOrigin
  isDark: boolean
  onRemove: () => void
  onDelete: () => void
  className?: string
}

export const EntryMenu: React.FC<EntryMenuProps> = ({ id, title, origin, isDark, onRemove, onDelete, className }) => {
  useTranslation()

  const userExists = useApplicationState((state) => !!state.user)

  return (
    <Dropdown className={`d-inline-flex ${className || ''}`} {...cypressId('history-entry-menu')}>
      <Dropdown.Toggle
        variant={isDark ? 'secondary' : 'light'}
        id={`dropdown-card-${id}`}
        className={`no-arrow ${styles['history-menu']} d-inline-flex align-items-center`}>
        <ForkAwesomeIcon icon='ellipsis-v' fixedWidth={true} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <Trans i18nKey='landing.history.menu.recentNotes' />
        </Dropdown.Header>

        <ShowIf condition={origin === HistoryEntryOrigin.LOCAL}>
          <Dropdown.Item disabled>
            <ForkAwesomeIcon icon='laptop' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='landing.history.menu.entryLocal' />
          </Dropdown.Item>
        </ShowIf>
        <ShowIf condition={origin === HistoryEntryOrigin.REMOTE}>
          <Dropdown.Item disabled>
            <ForkAwesomeIcon icon='cloud' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='landing.history.menu.entryRemote' />
          </Dropdown.Item>
        </ShowIf>
        <RemoveNoteEntryItem onConfirm={onRemove} noteTitle={title} />

        <ShowIf condition={userExists}>
          <Dropdown.Divider />
          <DeleteNoteItem onConfirm={onDelete} noteTitle={title} />
        </ShowIf>
      </Dropdown.Menu>
    </Dropdown>
  )
}
