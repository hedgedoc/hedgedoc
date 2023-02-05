/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../common/icons/ui-icon'
import styles from './social-link-button.module.scss'
import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Icon } from 'react-bootstrap-icons'

export interface SocialButtonProps {
  backgroundClass: string
  href: string
  icon: Icon
  title?: string
}

/**
 * Renders a link for a social login.
 *
 * @param title The link title
 * @param backgroundClass Additional classes for the a-tag
 * @param href The link
 * @param icon The icon to be used
 * @param children The children to be rendered in addition to the icon.
 */
export const SocialLinkButton: React.FC<PropsWithChildren<SocialButtonProps>> = ({
  title,
  backgroundClass,
  href,
  icon,
  children
}) => {
  return (
    <a
      href={href}
      title={title}
      className={`btn ${styles['social-link-button']} p-0 d-inline-flex align-items-stretch ${backgroundClass}`}>
      <span className={`${styles['icon-part']} d-flex align-items-center`}>
        <UiIcon icon={icon} className={styles['social-icon']} />
      </span>
      <span className={`${styles['text-part']} d-flex align-items-center mx-auto`}>{children}</span>
    </a>
  )
}
