import React, { Fragment, useState } from 'react'
import { TranslatedIconButton } from '../../../common/icon-button/translated-icon-button'
import { RevisionModal } from './revision-modal'

export interface RevisionButtonProps {
  noteContent: string
}

export const RevisionButton: React.FC<RevisionButtonProps> = ({ noteContent }) => {
  const [show, setShow] = useState(false)

  return (
    <Fragment>
      <TranslatedIconButton size={'sm'} className={'mx-1'} icon={'history'} variant={'light'} i18nKey={'editor.documentBar.revision'} onClick={() => setShow(true)}/>
      <RevisionModal show={show} onHide={() => setShow(false)} titleI18nKey={'editor.modal.revision.title'} icon={'history'} noteContent={noteContent}/>
    </Fragment>
  )
}
