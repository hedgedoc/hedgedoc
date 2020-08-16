import React from 'react'
import { useTranslation } from 'react-i18next'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'

export const PinToHistoryButton: React.FC = () => {
  useTranslation()

  const isPinned = true
  const i18nKey = isPinned ? 'editor.documentBar.pinNoteToHistory' : 'editor.documentBar.pinnedToHistory'

  return <TranslatedIconButton size={'sm'} className={'mx-1'} icon={'thumb-tack'} variant={'light'} i18nKey={i18nKey}/>
}
