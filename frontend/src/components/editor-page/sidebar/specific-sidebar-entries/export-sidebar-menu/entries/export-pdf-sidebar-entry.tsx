/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { SidebarButton } from '../../../sidebar-button/sidebar-button'
import React from 'react'
import { FilePdfFill as IconFilePdfFill } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { useExportToPdf } from '../../../../utils/export-to-pdf'

/**
 * Editor sidebar entry for exporting the markdown content as PDF.
 * This uses the same print rendering as the print button, and opens the browser's
 * print dialog where users can save as PDF.
 */
export const ExportPdfSidebarEntry: React.FC = () => {
  const exportToPdf = useExportToPdf()

  return (
    <SidebarButton {...cypressId('menu-export-pdf')} onClick={exportToPdf} icon={IconFilePdfFill}>
      <Trans i18nKey={'editor.export.pdf'} />
    </SidebarButton>
  )
}
