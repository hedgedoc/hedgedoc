/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../links.json'
import { ExportMarkdownSidebarEntry } from './export-markdown-sidebar-entry'
import { SidebarButton } from './sidebar-button'
import { SidebarMenu } from './sidebar-menu'
import { DocumentSidebarMenuSelection, SpecificSidebarMenuProps } from './types'

export const ExportMenuSidebarMenu: React.FC<SpecificSidebarMenuProps> = (
  {
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
      <SidebarButton data-cy={ 'menu-export' } hide={ hide } icon={ expand ? 'arrow-left' : 'cloud-download' }
                     className={ className } onClick={ onClickHandler }>
        <Trans i18nKey={ 'editor.documentBar.export' }/>
      </SidebarButton>
      <SidebarMenu expand={ expand }>
        <SidebarButton icon={ 'github' }>
          Gist
        </SidebarButton>
        <SidebarButton icon={ 'gitlab' }>
          Gitlab Snippet
        </SidebarButton>

        <ExportMarkdownSidebarEntry/>

        <SidebarButton icon={ 'file-code-o' }>
          HTML
        </SidebarButton>
        <SidebarButton icon={ 'file-code-o' }>
          <Trans i18nKey='editor.export.rawHtml'/>
        </SidebarButton>
        <SidebarButton icon={ 'file-pdf-o' }>
          <a className='small text-muted' dir={ 'auto' } href={ links.faq } target={ '_blank' }
             rel='noopener noreferrer'>
            <Trans i18nKey={ 'editor.export.pdf' }/>
            &nbsp;
            <span className={ 'text-primary' }>
                <Trans i18nKey={ 'common.why' }/>
              </span>
          </a>
        </SidebarButton>
      </SidebarMenu>
    </Fragment>
  )
}
