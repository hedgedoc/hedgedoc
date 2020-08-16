import React from 'react'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'

export const RevisionButton: React.FC = () => {
  return <TranslatedIconButton size={'sm'} className={'mx-1'} icon={'history'} variant={'light'} i18nKey={'editor.documentBar.revision'}/>
}
