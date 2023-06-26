/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { downloadHistory } from '../../../redux/history/methods'
import { UiIcon } from '../../common/icons/ui-icon'
import React from 'react'
import { Button } from 'react-bootstrap'
import { Download as IconDownload } from 'react-bootstrap-icons'

/**
 * Renders a button to export the history.
 */
export const ExportHistoryButton: React.FC = () => {
  const buttonTitle = useTranslatedText('landing.history.toolbar.export')

  return (
    <Button variant={'secondary'} title={buttonTitle} onClick={downloadHistory}>
      <UiIcon icon={IconDownload} />
    </Button>
  )
}
