/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../../utils/cypress-attribute'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../../types'
import { DocumentSidebarMenuSelection } from '../../types'
import { NoteInfoLineContributors } from './note-info-line/note-info-line-contributors'
import { NoteInfoLineCreatedAt } from './note-info-line/note-info-line-created-at'
import { NoteInfoLineUpdatedAt } from './note-info-line/note-info-line-updated-at'
import { NoteInfoLineUpdatedBy } from './note-info-line/note-info-line-updated-by'
import { NoteInfoLineWordCount } from './note-info-line/note-info-line-word-count'
import React, { Fragment, useCallback } from 'react'
import { ArrowLeft as IconArrowLeft, GraphUp as IconGraphUp } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import styles from '../../sidebar-button/sidebar-button.module.scss'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'

/**
 * Renders the note info menu for the sidebar.
 *
 * @param className Additional class names given to the menu button
 * @param menuId The id of the menu
 * @param onClick The callback, that should be called when the menu button is pressed
 * @param selectedMenuId The currently selected menu id
 */
export const NoteInfoSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
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
        {...cypressId('sidebar-menu-info')}
        hide={hide}
        icon={expand ? IconArrowLeft : IconGraphUp}
        className={concatCssClasses(className, { [styles.main]: expand })}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.noteInfo.title'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <NoteInfoLineCreatedAt />
        <NoteInfoLineUpdatedAt />
        <NoteInfoLineUpdatedBy />
        <NoteInfoLineContributors />
        <NoteInfoLineWordCount visible={expand} />
      </SidebarMenu>
    </Fragment>
  )
}
