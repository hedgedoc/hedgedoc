/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import { ButtonProps } from 'react-bootstrap/Button'
import { Trans, useTranslation } from 'react-i18next'
import { LinkContainer } from 'react-router-bootstrap'
import { ShowIf } from '../../common/show-if/show-if'
import { getApiUrl } from '../../../api/utils'
import { INTERACTIVE_LOGIN_METHODS } from '../../../api/auth'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export type SignInButtonProps = Omit<ButtonProps, 'href'>

export const SignInButton: React.FC<SignInButtonProps> = ({ variant, ...props }) => {
  const { t } = useTranslation()
  const authProviders = useApplicationState((state) => state.config.authProviders)
  const authEnabled = useMemo(() => Object.values(authProviders).includes(true), [authProviders])

  const loginLink = useMemo(() => {
    const activeProviders = Object.entries(authProviders)
      .filter((entry: [string, boolean]) => entry[1])
      .map((entry) => entry[0])
    const activeOneClickProviders = activeProviders.filter((entry) => !INTERACTIVE_LOGIN_METHODS.includes(entry))

    if (activeProviders.length === 1 && activeOneClickProviders.length === 1) {
      return `${getApiUrl()}auth/${activeOneClickProviders[0]}`
    }
    return '/login'
  }, [authProviders])

  return (
    <ShowIf condition={authEnabled}>
      <LinkContainer to={loginLink} title={t('login.signIn')}>
        <Button data-cy={'sign-in-button'} variant={variant || 'success'} {...props}>
          <Trans i18nKey='login.signIn' />
        </Button>
      </LinkContainer>
    </ShowIf>
  )
}
