import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../fork-awesome/fork-awesome-icon'

export const NewUserNoteButton: React.FC = () => {
  const { t } = useTranslation()
  return (
    <LinkContainer to={'/new'} title={t('landing.navigation.newNote')}>
      <Button
        variant="primary"
        size="sm"
        className="d-inline-flex align-items-center">
        <ForkAwesomeIcon icon="plus" className="mr-1"/>
        <span>
          <Trans i18nKey='landing.navigation.newNote'/>
        </span>
      </Button>
    </LinkContainer>
  )
}
