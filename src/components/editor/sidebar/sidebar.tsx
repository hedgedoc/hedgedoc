/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import { DeleteNoteSidebarEntry } from './delete-note-sidebar-entry'
import { DocumentInfoSidebarEntry } from './document-info-sidebar-entry'
import { ExportMenuSidebarMenu } from './export-menu-sidebar-menu'
import { ImportMenuSidebarMenu } from './import-menu-sidebar-menu'
import { PermissionsSidebarEntry } from './permissions-sidebar-entry'
import { PinNoteSidebarEntry } from './pin-note-sidebar-entry'
import { RevisionSidebarEntry } from './revision-sidebar-entry'
import { ShareSidebarEntry } from './share-sidebar-entry'
import "./style/theme.scss"
import { DocumentSidebarMenuSelection } from './types'
import { UsersOnlineSidebarMenu } from './users-online-sidebar-menu/users-online-sidebar-menu'

export const Sidebar: React.FC = () => {

  const sideBarRef = useRef<HTMLDivElement>(null)
  const [selectedMenu, setSelectedMenu] = useState<DocumentSidebarMenuSelection>(DocumentSidebarMenuSelection.NONE)

  useClickAway(sideBarRef, () => {
    setSelectedMenu(DocumentSidebarMenuSelection.NONE)
  })

  const toggleValue = useCallback((toggleValue: DocumentSidebarMenuSelection): void => {
    const newValue = selectedMenu === toggleValue ? DocumentSidebarMenuSelection.NONE : toggleValue
    setSelectedMenu(newValue)
  }, [selectedMenu])

  const selectionIsNotNone = selectedMenu !== DocumentSidebarMenuSelection.NONE

  return (
    <div className="slide-sidebar">
      <div ref={sideBarRef} className={`sidebar-inner ${selectionIsNotNone ? 'show' : ''}`}>
        <UsersOnlineSidebarMenu menuId={DocumentSidebarMenuSelection.USERS_ONLINE}
                                selectedMenuId={selectedMenu} onClick={toggleValue}/>
        <DocumentInfoSidebarEntry hide={selectionIsNotNone}/>
        <RevisionSidebarEntry hide={selectionIsNotNone}/>
        <PermissionsSidebarEntry hide={selectionIsNotNone}/>
        <ImportMenuSidebarMenu menuId={DocumentSidebarMenuSelection.IMPORT}
                               selectedMenuId={selectedMenu} onClick={toggleValue}/>
        <ExportMenuSidebarMenu menuId={DocumentSidebarMenuSelection.EXPORT}
                               selectedMenuId={selectedMenu} onClick={toggleValue}/>
        <ShareSidebarEntry hide={selectionIsNotNone}/>
        <DeleteNoteSidebarEntry hide={selectionIsNotNone}/>
        <PinNoteSidebarEntry hide={selectionIsNotNone}/>
      </div>
    </div>
  )
}
