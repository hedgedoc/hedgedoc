/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import type { ButtonProps } from 'react-bootstrap/Button'
import { Trans, useTranslation } from 'react-i18next'
import { ShowIf } from '../../common/show-if/show-if'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'
import Link from 'next/link'
import { filterOneClickProviders } from '../../login-page/auth/utils'
import { getOneClickProviderMetadata } from '../../login-page/auth/utils/get-one-click-provider-metadata'

export type SignInButtonProps = Omit<ButtonProps, 'href'>

/**
 * Renders a sign-in button if auth providers are defined.
 * It links to either the login page or if only a single one-click provider is configured, to that one.
 *
 * @param variant The style variant as inferred from the common button component.
 * @param props Further props inferred from the common button component.
 */
export const SignInButton: React.FC<SignInButtonProps> = ({ variant, ...props }) => {
  const { t } = useTranslation()
  const authProviders = useApplicationState((state) => state.config.authProviders)

  const loginLink = useMemo(() => {
    const oneClickProviders = authProviders.filter(filterOneClickProviders)
    if (authProviders.length === 1 && oneClickProviders.length === 1) {
      const metadata = getOneClickProviderMetadata(oneClickProviders[0])
      return metadata.url
    }
    return 'login'
  }, [authProviders])

  return (
    <ShowIf condition={authProviders.length > 0}>
      <Link href={loginLink} passHref={true}>
        <Button title={t('login.signIn')} {...cypressId('sign-in-button')} variant={variant || 'success'} {...props}>
          <Trans i18nKey='login.signIn' />
        </Button>
      </Link>
    </ShowIf>
  )
}
