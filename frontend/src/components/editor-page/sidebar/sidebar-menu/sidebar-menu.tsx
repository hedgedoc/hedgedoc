/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../../utils/concat-css-classes'
import type { SidebarMenuProps } from '../types'
import styles from './sidebar-menu.module.scss'
import type { PropsWithChildren } from 'react'
import React from 'react'

/**
 * Renders a sidebar menu.
 *
 * @param children The children in the menu.
 * @param expand If the menu is extended (and the children are shown) or not.
 */
export const SidebarMenu: React.FC<PropsWithChildren<SidebarMenuProps>> = ({ children, expand }) => {
  return (
    <div className={concatCssClasses(styles.menu, { [styles['show']]: expand })}>
      <div className={`d-flex flex-column`}>{children}</div>
    </div>
  )
}
