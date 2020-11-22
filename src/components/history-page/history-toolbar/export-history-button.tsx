/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

export interface ExportHistoryButtonProps {
  onExportHistory: () => void
}

export const ExportHistoryButton: React.FC<ExportHistoryButtonProps> = ({ onExportHistory }) => {
  const { t } = useTranslation()

  return (
    <Button variant={'light'} title={t('landing.history.toolbar.export')} onClick={onExportHistory}>
      <ForkAwesomeIcon icon='download'/>
    </Button>
  )
}
