/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../common/icons/ui-icon'
import styles from './sidebar-menu-info-entry.module.css'
import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Icon } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export interface SidebarMenuInfoEntryProps {
  titleI18nKey: string
  icon?: Icon
}

/**
 * Renders an info entry for a sidebar menu.
 *
 * @param children The content of the entry
 * @param titleI18nKey The i18n key for the title
 * @param icon An optional icon as prefix
 */
export const SidebarMenuInfoEntry: React.FC<PropsWithChildren<SidebarMenuInfoEntryProps>> = ({
  children,
  titleI18nKey,
  icon
}) => {
  useTranslation()

  return (
    <div className={`d-flex flex-row align-items-center p-1 ${styles['entry']}`}>
      {icon !== undefined && <UiIcon icon={icon} className={'mx-2'} size={1.25} />}
      <div className={'d-flex flex-column px-1'}>
        <span className={styles['title']}>
          <Trans i18nKey={titleI18nKey} />
        </span>
        {children}
      </div>
    </div>
  )
}
