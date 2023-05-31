/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { downloadHistory } from '../../../redux/history/methods'
import { UiIcon } from '../../common/icons/ui-icon'
import React from 'react'
import { Button } from 'react-bootstrap'
import { Download as IconDownload } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Renders a button to export the history.
 */
export const ExportHistoryButton: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Button variant={'secondary'} title={t('landing.history.toolbar.export') ?? undefined} onClick={downloadHistory}>
      <UiIcon icon={IconDownload} />
    </Button>
  )
}
