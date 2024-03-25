/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import type { RefObject } from 'react'
import type { Icon } from 'react-bootstrap-icons'

export interface SpecificSidebarEntryProps {
  className?: string
  hide?: boolean
  onClick?: () => void
}

export interface SidebarEntryProps extends PropsWithDataCypressId {
  icon?: Icon
  buttonRef?: RefObject<HTMLButtonElement>
  hide?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export interface SidebarMenuProps {
  expand?: boolean
}

export enum DocumentSidebarMenuSelection {
  NONE,
  USERS_ONLINE,
  NOTE_INFO,
  MEDIA_BROWSER,
  IMPORT,
  EXPORT
}

export interface SpecificSidebarMenuProps {
  className?: string
  onClick: (menuId: DocumentSidebarMenuSelection) => void
  selectedMenuId: DocumentSidebarMenuSelection
  menuId: DocumentSidebarMenuSelection
}
