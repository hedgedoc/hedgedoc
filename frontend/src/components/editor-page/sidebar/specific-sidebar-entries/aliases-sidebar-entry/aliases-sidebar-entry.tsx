/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { DocumentSidebarMenuSelection, type SpecificSidebarMenuProps } from '../../types'
import React, { Fragment, useCallback } from 'react'
import { ArrowLeft as IconArrowLeft, Tags as IconTags } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import { AliasesList } from './alias-menu/aliases-list'
import { AliasesAddForm } from './alias-menu/aliases-add-form'
import { SidebarMenuInfoEntry } from '../../sidebar-menu-info-entry/sidebar-menu-info-entry'

/**
 * Component that shows a button in the editor sidebar for opening the aliases modal.
 *
 * @param className Additional CSS classes that should be added to the sidebar button.
 * @param hide True when the sidebar button should be hidden, False otherwise.
 */
export const AliasesSidebarEntry: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  useTranslation()
  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        className={className}
        icon={expand ? IconArrowLeft : IconTags}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.aliases.title'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.aliases.explanation.title'}>
          <Trans i18nKey={'editor.aliases.explanation.text'} />
        </SidebarMenuInfoEntry>
        <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.aliases.title'}>
          <AliasesList />
          <AliasesAddForm />
        </SidebarMenuInfoEntry>
      </SidebarMenu>
    </Fragment>
  )
}
