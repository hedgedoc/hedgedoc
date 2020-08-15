import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

export const PinToHistoryButton: React.FC = () => {
  useTranslation()

  const isPinned = true
  const i18nKey = isPinned ? 'editor.documentBar.pinNoteToHistory' : 'editor.documentBar.pinnedToHistory'

  return (
    <Button variant={'light'} className={'mx-1'} size={'sm'}>
      <ForkAwesomeIcon icon={'thumb-tack'} className={'mx-1'}/>
      <Trans i18nKey={i18nKey}/>
    </Button>
  )
}
