/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { SidebarButton } from '../../../sidebar-button/sidebar-button'
import React from 'react'
import { PrinterFill as IconPrinterFill } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { usePrintIframe } from '../../../../utils/print-iframe'

/**
 * Editor sidebar entry for exporting the markdown content into a local file.
 */
export const ExportPrintSidebarEntry: React.FC = () => {
  const printIframe = usePrintIframe()

  return (
    <SidebarButton {...cypressId('menu-export-print')} onClick={printIframe} icon={IconPrinterFill}>
      <Trans i18nKey={'editor.export.print'} />
    </SidebarButton>
  )
}
