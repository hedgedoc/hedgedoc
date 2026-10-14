/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Trans } from 'react-i18next'
import { FileEarmarkCode as IconFileEarmarkCode } from 'react-bootstrap-icons'
import { SidebarButton } from '../../../../sidebar-button/sidebar-button'
import { useHtmlExportRequest } from './use-html-export-request'
import type { ExportButtonProps } from '../../types'
import { ExportMenuSelection } from '../../types'

/**
 * Editor sidebar entry for exporting the unstyled HTML content into a local file.
 * This works by sending a request to the iframe for retrieving and processing
 * the content and downloading the returned HTML.
 */
export const ExportUnstyledHtmlSidebarEntry: React.FC<ExportButtonProps> = ({ selectedMenuId }) => {
  const { onClick } = useHtmlExportRequest(false)
  const hide = selectedMenuId !== ExportMenuSelection.NONE

  return (
    <SidebarButton hide={hide} onClick={onClick} icon={IconFileEarmarkCode}>
      <Trans i18nKey={'editor.importExport.service.unstyled-html'} />
    </SidebarButton>
  )
}
