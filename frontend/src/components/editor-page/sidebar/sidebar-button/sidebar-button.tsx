/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../../utils/concat-css-classes'
import { UiIcon } from '../../../common/icons/ui-icon'
import type { SidebarEntryProps } from '../types'
import styles from './sidebar-button.module.scss'
import type { PropsWithChildren } from 'react'
import React, { useCallback } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import type { OverlayInjectedProps } from 'react-bootstrap/Overlay'

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
  const tooltip = useCallback(
    (overlayInjectedProps: OverlayInjectedProps) => {
      if (!disabled) {
        return <></>
      }
      return <Tooltip {...overlayInjectedProps}>This feature is not yet supported.</Tooltip>
    },
    [disabled]
  )

  return (
    <OverlayTrigger overlay={tooltip}>
      <button
        ref={buttonRef}
        className={concatCssClasses(styles.button, className, { [styles.hide]: hide })}
        disabled={disabled}
        {...props}>
        {icon !== undefined && (
          <span className={`sidebar-button-icon ${styles.icon}`}>
            <UiIcon icon={icon} />
          </span>
        )}
        <span className={concatCssClasses(styles.text, { [styles.disabled]: disabled })}>{children}</span>
      </button>
    </OverlayTrigger>
  )
}
