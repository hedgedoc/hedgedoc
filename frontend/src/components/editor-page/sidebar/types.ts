/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import type { IconName } from '../../common/fork-awesome/types'
import type { RefObject } from 'react'

export interface SpecificSidebarEntryProps {
  className?: string
  hide?: boolean
  onClick?: () => void
}

export interface SidebarEntryProps extends PropsWithDataCypressId {
  icon?: IconName
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
  IMPORT,
  EXPORT
}

export interface SpecificSidebarMenuProps {
  className?: string
  onClick: (menuId: DocumentSidebarMenuSelection) => void
  selectedMenuId: DocumentSidebarMenuSelection
  menuId: DocumentSidebarMenuSelection
}
