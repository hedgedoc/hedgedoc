import React from 'react'
import { Button } from 'react-bootstrap'
import { ButtonProps } from 'react-bootstrap/Button'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { ApplicationState } from '../../../redux'
import { ShowIf } from '../../common/show-if/show-if'

type SignInButtonProps = {
  className?: string
} & Omit<ButtonProps, 'href'>

export const SignInButton: React.FC<SignInButtonProps> = ({ variant, ...props }) => {
  const { t } = useTranslation()
  const anyAuthProviderActive = useSelector((state: ApplicationState) => Object.values(state.config.authProviders).includes(true))
  return (
    <ShowIf condition={anyAuthProviderActive}>
      <LinkContainer to="/login" title={t('login.signIn')}>
        <Button
          variant={variant || 'success'}
          {...props}
        >
          <Trans i18nKey="login.signIn"/>
        </Button>
      </LinkContainer>
    </ShowIf>
  )
}
