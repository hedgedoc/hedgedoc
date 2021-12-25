/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { downloadHistory } from '../../../redux/history/methods'

export const ExportHistoryButton: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Button variant={'light'} title={t('landing.history.toolbar.export')} onClick={downloadHistory}>
      <ForkAwesomeIcon icon='download' />
    </Button>
  )
}
