/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../../common/fork-awesome/types'
import { ShowIf } from '../../../common/show-if/show-if'
import type { SidebarEntryProps } from '../types'
import styles from './sidebar-button.module.scss'
import type { PropsWithChildren } from 'react'
import React from 'react'

/**
 * A button that should be rendered in the sidebar.
 *
 * @param children The react elements in the button
 * @param icon The icon on the left side of the button
 * @param className Additional css class names
 * @param buttonRef A reference to the button
 * @param hide Should be {@link true} if the button should be invisible
 * @param variant An alternative theme for the button
 * @param disabled If the button should be disabled
 * @param props Other button props
 */
export const SidebarButton: React.FC<PropsWithChildren<SidebarEntryProps>> = ({
  children,
  icon,
  className,
  buttonRef,
  hide,
  disabled,
  ...props
}) => {
  return (
    <button
      ref={buttonRef}
      className={`${styles['sidebar-button']} ${hide ? styles['hide'] : ''} ${className ?? ''}`}
      disabled={disabled}
      {...props}>
      <ShowIf condition={!!icon}>
        <span className={`sidebar-button-icon ${styles['sidebar-icon']}`}>
          <ForkAwesomeIcon icon={icon as IconName} />
        </span>
      </ShowIf>
      <span className={styles['sidebar-text']}>{children}</span>
    </button>
  )
}
