import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'

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
