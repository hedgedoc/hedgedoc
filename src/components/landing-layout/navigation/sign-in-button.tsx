/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import type { ButtonProps } from 'react-bootstrap/Button'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../common/show-if/show-if'
import { INTERACTIVE_LOGIN_METHODS } from '../../../api/auth'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'
import { useBackendBaseUrl } from '../../../hooks/common/use-backend-base-url'
import Link from 'next/link'

export type SignInButtonProps = Omit<ButtonProps, 'href'>

export const SignInButton: React.FC<SignInButtonProps> = ({ variant, ...props }) => {
  const { t } = useTranslation()
  const backendBaseUrl = useBackendBaseUrl()
  const authProviders = useApplicationState((state) => state.config.authProviders)
  const authEnabled = useMemo(() => Object.values(authProviders).includes(true), [authProviders])

  const loginLink = useMemo(() => {
    const activeProviders = Object.entries(authProviders)
      .filter((entry: [string, boolean]) => entry[1])
      .map((entry) => entry[0])
    const activeOneClickProviders = activeProviders.filter((entry) => !INTERACTIVE_LOGIN_METHODS.includes(entry))

    if (activeProviders.length === 1 && activeOneClickProviders.length === 1) {
      return `${backendBaseUrl}auth/${activeOneClickProviders[0]}`
    }
    return '/login'
  }, [authProviders, backendBaseUrl])

  return (
    <ShowIf condition={authEnabled}>
      <Link href={loginLink} passHref={true}>
        <Button title={t('login.signIn')} {...cypressId('sign-in-button')} variant={variant || 'success'} {...props}>
          <Trans i18nKey='login.signIn' />
        </Button>
      </Link>
    </ShowIf>
  )
}
