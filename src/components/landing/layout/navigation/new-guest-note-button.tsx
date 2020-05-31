import React from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Trans, useTranslation } from 'react-i18next'

export const NewGuestNoteButton: React.FC = () => {
  const { t } = useTranslation()
  return (
    <LinkContainer to={'/new'} title={t('landing.navigation.newGuestNote')}>
      <Button
        variant="primary"
        size="sm"
        className="d-inline-flex align-items-center">
        <FontAwesomeIcon icon="plus" className="mr-1"/>
        <span>
          <Trans i18nKey='landing.navigation.newGuestNote'/>
        </span>
      </Button>
    </LinkContainer>)
}
