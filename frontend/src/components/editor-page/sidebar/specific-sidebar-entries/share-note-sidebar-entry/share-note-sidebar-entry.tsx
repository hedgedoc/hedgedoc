/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { DocumentSidebarMenuSelection, type SpecificSidebarMenuProps } from '../../types'
import React, { Fragment, useCallback } from 'react'
import { ArrowLeft as IconArrowLeft, Share as IconShare } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { LinkType, NoteUrlField } from './share-modal/note-url-field'
import { NoteType } from '@hedgedoc/commons'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import { SidebarMenuInfoEntry } from '../../sidebar-menu-info-entry/sidebar-menu-info-entry'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'

/**
 * Renders a button to open the share modal for the sidebar.
 *
 * @param className Additional classes directly given to the button
 * @param hide If the button should be hidden
 */
export const ShareNoteSidebarEntry: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])
  useTranslation()
  const noteFrontmatter = useApplicationState((state) => state.noteDetails?.frontmatter)

  if (!noteFrontmatter) {
    return null
  }

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        className={className}
        icon={expand ? IconArrowLeft : IconShare}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.shareLink.title'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.shareLink.editor.title'}>
          <small className={'py-2 text-muted'}>
            <Trans i18nKey={'editor.shareLink.editor.description'} />
          </small>
          <NoteUrlField type={LinkType.EDITOR} />
        </SidebarMenuInfoEntry>
        {noteFrontmatter.type === NoteType.SLIDE && (
          <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.shareLink.slides.title'}>
            <small className={'py-2 text-muted'}>
              <Trans i18nKey={'editor.shareLink.slides.description'} />
            </small>
            <NoteUrlField type={LinkType.SLIDESHOW} />
          </SidebarMenuInfoEntry>
        )}
        {noteFrontmatter.type === NoteType.DOCUMENT && (
          <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.shareLink.viewOnly.title'}>
            <small className={'py-2 text-muted '}>
              <Trans i18nKey={'editor.shareLink.viewOnly.description'} />
            </small>
            <NoteUrlField type={LinkType.DOCUMENT} />
          </SidebarMenuInfoEntry>
        )}
      </SidebarMenu>
    </Fragment>
  )
}
