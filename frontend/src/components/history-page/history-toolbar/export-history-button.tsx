/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { downloadHistory } from '../../../redux/history/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

/**
 * Renders a button to export the history.
 */
export const ExportHistoryButton: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Button variant={'light'} title={t('landing.history.toolbar.export') ?? undefined} onClick={downloadHistory}>
      <ForkAwesomeIcon icon='download' />
    </Button>
  )
}
