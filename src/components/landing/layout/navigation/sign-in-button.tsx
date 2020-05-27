import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { LinkContainer } from 'react-router-bootstrap'

export const SignInButton: React.FC = () => {
  const { i18n } = useTranslation()

  return (
    <LinkContainer to="/login" title={i18n.t('signIn')}>
      <Button
        variant="success"
        size="sm"
      >
        <Trans i18nKey="signIn"/>
      </Button>
    </LinkContainer>
  )
}
