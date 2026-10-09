/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../common/icons/ui-icon'
import sidebarMenuEntryStyle from './sidebar-menu-info-entry.module.css'
import type { PropsWithChildren } from 'react'
import { Fragment, useMemo } from 'react'
import React from 'react'
import type { Icon } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export interface SidebarMenuInfoEntryProps {
  titleI18nKey: string
  icon?: Icon
  prefixComponent?: React.ReactNode
}

/**
 * Renders an info entry for a sidebar menu.
 *
 * @param children The content of the entry
 * @param titleI18nKey The i18n key for the title
 * @param icon An optional icon as a prefix
 * @param prefixComponent An optional prefix component
 *
 * The prefixComponent has precedence over the icon. So if both are set the prefixComponent will be displayed
 */
export const SidebarMenuInfoEntry: React.FC<PropsWithChildren<SidebarMenuInfoEntryProps>> = ({
  children,
  titleI18nKey,
  icon,
  prefixComponent
}) => {
  useTranslation()

  const iconComponent = useMemo(() => {
    if (icon === undefined && prefixComponent === undefined) {
      return <Fragment />
    }
    if (prefixComponent !== undefined) {
      return prefixComponent
    }
    return <UiIcon icon={icon} className={'mx-2'} size={1.25} />
  }, [icon, prefixComponent])

  return (
    <div className={`d-flex flex-row align-items-center p-1 ${sidebarMenuEntryStyle['entry']}`}>
      {iconComponent}
      <div className={`d-flex flex-column px-1 ${sidebarMenuEntryStyle['container']}`}>
        <span className={sidebarMenuEntryStyle['title']}>
          <Trans i18nKey={titleI18nKey} />
        </span>
        {children}
      </div>
    </div>
  )
}
