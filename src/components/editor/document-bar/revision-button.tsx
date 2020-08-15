import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

export const RevisionButton: React.FC = () => {
  return (
    <Button variant={'light'} className={'mx-1'} size={'sm'}>
      <ForkAwesomeIcon icon={'history'} className={'mx-1'}/>
      <Trans i18nKey={'editor.documentBar.revision'}/>
    </Button>
  )
}
