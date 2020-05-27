import { LinkContainer } from 'react-router-bootstrap'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const NewUserNoteButton: React.FC = () => {
  const { i18n } = useTranslation()
  return (
    <LinkContainer to={'/new'} title={i18n.t('newNote')}>
      <Button
        variant="primary"
        size="sm"
        className="d-inline-flex align-items-center">
        <FontAwesomeIcon icon="plus" className="mr-1"/>
        <span>
          <Trans i18nKey='newNote'/>
        </span>
      </Button>
    </LinkContainer>
  )
}
