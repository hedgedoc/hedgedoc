/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasesSidebarEntry } from './specific-sidebar-entries/aliases-sidebar-entry/aliases-sidebar-entry'
import { DeleteNoteSidebarEntry } from './specific-sidebar-entries/delete-note-sidebar-entry/delete-note-sidebar-entry'
import { ExportSidebarMenu } from './specific-sidebar-entries/export-sidebar-menu/export-sidebar-menu'
import { ImportMenuSidebarMenu } from './specific-sidebar-entries/import-menu-sidebar-menu'
import { MediaBrowserSidebarMenu } from './specific-sidebar-entries/media-browser-sidebar-menu/media-browser-sidebar-menu'
import { NoteInfoSidebarMenu } from './specific-sidebar-entries/note-info-sidebar-menu/note-info-sidebar-menu'
import { PermissionsSidebarEntry } from './specific-sidebar-entries/permissions-sidebar-entry/permissions-sidebar-entry'
import { PinNoteSidebarEntry } from './specific-sidebar-entries/pin-note-sidebar-entry/pin-note-sidebar-entry'
import { RevisionSidebarEntry } from './specific-sidebar-entries/revisions-sidebar-entry/revision-sidebar-entry'
import { ShareNoteSidebarEntry } from './specific-sidebar-entries/share-note-sidebar-entry/share-note-sidebar-entry'
import { UsersOnlineSidebarMenu } from './specific-sidebar-entries/users-online-sidebar-menu/users-online-sidebar-menu'
import styles from './style/sidebar.module.scss'
import { DocumentSidebarMenuSelection } from './types'
import React, { useCallback, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import { useIsOwner } from '../../../hooks/common/use-is-owner'

/**
 * Renders the sidebar for the editor.
 */
export const Sidebar: React.FC = () => {
  const sideBarRef = useRef<HTMLDivElement>(null)
  const [selectedMenu, setSelectedMenu] = useState<DocumentSidebarMenuSelection>(DocumentSidebarMenuSelection.NONE)
  const isOwner = useIsOwner()

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
    <div className={styles['slide-sidebar']} id={'editor-sidebar'}>
      <div ref={sideBarRef} className={`${styles['sidebar-inner']} ${selectionIsNotNone ? styles['show'] : ''}`}>
        <UsersOnlineSidebarMenu
          menuId={DocumentSidebarMenuSelection.USERS_ONLINE}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <NoteInfoSidebarMenu
          menuId={DocumentSidebarMenuSelection.NOTE_INFO}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <RevisionSidebarEntry hide={selectionIsNotNone} />
        <PermissionsSidebarEntry hide={selectionIsNotNone} />
        <AliasesSidebarEntry hide={selectionIsNotNone} />
        <MediaBrowserSidebarMenu
          onClick={toggleValue}
          selectedMenuId={selectedMenu}
          menuId={DocumentSidebarMenuSelection.MEDIA_BROWSER}
        />
        <ImportMenuSidebarMenu
          menuId={DocumentSidebarMenuSelection.IMPORT}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <ExportSidebarMenu
          menuId={DocumentSidebarMenuSelection.EXPORT}
          selectedMenuId={selectedMenu}
          onClick={toggleValue}
        />
        <ShareNoteSidebarEntry hide={selectionIsNotNone} />
        {isOwner && <DeleteNoteSidebarEntry hide={selectionIsNotNone} />}
        <PinNoteSidebarEntry hide={selectionIsNotNone} />
      </div>
    </div>
  )
}
