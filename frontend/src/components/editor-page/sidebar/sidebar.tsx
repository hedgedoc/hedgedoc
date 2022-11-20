/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import { DeleteNoteSidebarEntry } from './delete-note-sidebar-entry/delete-note-sidebar-entry'
import { NoteInfoSidebarEntry } from './specific-sidebar-entries/note-info-sidebar-entry'
import { ExportMenuSidebarMenu } from './specific-sidebar-entries/export-menu-sidebar-menu'
import { ImportMenuSidebarMenu } from './specific-sidebar-entries/import-menu-sidebar-menu'
import { PermissionsSidebarEntry } from './specific-sidebar-entries/permissions-sidebar-entry'
import { PinNoteSidebarEntry } from './specific-sidebar-entries/pin-note-sidebar-entry'
import { RevisionSidebarEntry } from './specific-sidebar-entries/revision-sidebar-entry'
import { ShareSidebarEntry } from './specific-sidebar-entries/share-sidebar-entry'
import styles from './style/sidebar.module.scss'
import { DocumentSidebarMenuSelection } from './types'
import { UsersOnlineSidebarMenu } from './users-online-sidebar-menu/users-online-sidebar-menu'
import { AliasesSidebarEntry } from './specific-sidebar-entries/aliases-sidebar-entry'

/**
 * Renders the sidebar for the editor.
 */
export const Sidebar: React.FC = () => {
  const sideBarRef = useRef<HTMLDivElement>(null)
  const [selectedMenu, setSelectedMenu] = useState<DocumentSidebarMenuSelection>(DocumentSidebarMenuSelection.NONE)

  useClickAway(sideBarRef, () => {
    setSelectedMenu(DocumentSidebarMenuSelection.NONE)
  })

  const toggleValue = useCallback(
    (toggleValue: DocumentSidebarMenuSelection): void => {
      const newValue = selectedMenu === toggleValue ? DocumentSidebarMenuSelection.NONE : toggleValue
      setSelectedMenu(newValue)
    },
    [selectedMenu]
  )

  const selectionIsNotNone = selectedMenu !== DocumentSidebarMenuSelection.NONE

  return (
    <div className={styles['slide-sidebar']}>
      <div ref={sideBarRef} className={`${styles['sidebar-inner']} ${selectionIsNotNone ? styles['show'] : ''}`}>
        <UsersOnlineSidebarMenu
          menuId={DocumentSidebarMenuSelection.USERS_ONLINE}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <NoteInfoSidebarEntry hide={selectionIsNotNone} />
        <RevisionSidebarEntry hide={selectionIsNotNone} />
        <PermissionsSidebarEntry hide={selectionIsNotNone} />
        <AliasesSidebarEntry hide={selectionIsNotNone} />
        <ImportMenuSidebarMenu
          menuId={DocumentSidebarMenuSelection.IMPORT}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <ExportMenuSidebarMenu
          menuId={DocumentSidebarMenuSelection.EXPORT}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <ShareSidebarEntry hide={selectionIsNotNone} />
        <DeleteNoteSidebarEntry hide={selectionIsNotNone} />
        <PinNoteSidebarEntry hide={selectionIsNotNone} />
      </div>
    </div>
  )
}
