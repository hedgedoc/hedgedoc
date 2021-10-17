/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RefObject } from 'react'
import type { IconName } from '../../common/fork-awesome/types'
import type { SidebarEntryVariant } from './sidebar-button'

export interface SpecificSidebarEntryProps {
  className?: string
  hide?: boolean
  onClick?: () => void
}

export interface SidebarEntryProps {
  icon?: IconName
  variant?: SidebarEntryVariant
  buttonRef?: RefObject<HTMLButtonElement>
  hide?: boolean
  className?: string
  onClick?: () => void
  'data-cy'?: string
}

export interface SidebarMenuProps {
  expand?: boolean
}

export enum DocumentSidebarMenuSelection {
  NONE,
  USERS_ONLINE,
  IMPORT,
  EXPORT
}

export interface SpecificSidebarMenuProps {
  className?: string
  onClick: (menuId: DocumentSidebarMenuSelection) => void
  selectedMenuId: DocumentSidebarMenuSelection
  menuId: DocumentSidebarMenuSelection
}
