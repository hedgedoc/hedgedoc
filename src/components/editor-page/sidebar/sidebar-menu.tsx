/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import type { SidebarMenuProps } from './types'

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ children, expand }) => {
  return (
    <div className={`sidebar-menu ${expand ? 'show' : ''}`}>
      <div className={`d-flex flex-column`}>{children}</div>
    </div>
  )
}
