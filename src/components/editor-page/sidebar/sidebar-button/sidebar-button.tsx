/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../../common/fork-awesome/types'
import { ShowIf } from '../../../common/show-if/show-if'
import type { SidebarEntryProps } from '../types'
import styles from './sidebar-button.module.scss'

export interface SidebarButton extends SidebarEntryProps {
  variant?: 'primary'
}

/**
 * A button that should be rendered in the sidebar.
 *
 * @param children The react elements in the button
 * @param icon The icon on the left side of the button
 * @param className Additional css class names
 * @param buttonRef A reference to the button
 * @param hide Should be {@code true} if the button should be invisible
 * @param variant An alternative theme for the button
 * @param props Other button props
 */
export const SidebarButton: React.FC<PropsWithChildren<SidebarButton>> = ({
  children,
  icon,
  className,
  buttonRef,
  hide,
  variant,
  disabled,
  ...props
}) => {
  const variantClass = useMemo(() => {
    return variant !== undefined ? styles['sidebar-button-' + variant] : ''
  }, [variant])

  return (
    <button
      ref={buttonRef}
      className={`${styles['sidebar-button']} ${variantClass} ${hide ? styles['hide'] : ''} ${className ?? ''}`}
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
