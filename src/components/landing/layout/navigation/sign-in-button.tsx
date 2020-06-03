import React from 'react'
import { Button } from 'react-bootstrap'
import { ButtonProps } from 'react-bootstrap/Button'
import { Trans, useTranslation } from 'react-i18next'
import { LinkContainer } from 'react-router-bootstrap'

type SignInButtonProps = {
  className?: string
} & Omit<ButtonProps, 'href'>

export const SignInButton: React.FC<SignInButtonProps> = ({ variant, ...props }) => {
  const { t } = useTranslation()

  return (
    <LinkContainer to="/login" title={t('login.signIn')}>
      <Button
        variant={variant || 'success'}
        {...props}
      >
        <Trans i18nKey="login.signIn"/>
      </Button>
    </LinkContainer>
  )
}
