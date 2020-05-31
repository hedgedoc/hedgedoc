import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { LinkContainer } from 'react-router-bootstrap'

export const SignInButton: React.FC = () => {
  const { t } = useTranslation()

  return (
    <LinkContainer to="/login" title={t('login.signIn')}>
      <Button
        variant="success"
        size="sm"
      >
        <Trans i18nKey="login.signIn"/>
      </Button>
    </LinkContainer>
  )
}
