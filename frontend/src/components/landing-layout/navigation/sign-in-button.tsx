/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { cypressId } from '../../../utils/cypress-attribute'
import { useFrontendConfig } from '../../common/frontend-config-context/use-frontend-config'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { Button } from 'react-bootstrap'
import type { ButtonProps } from 'react-bootstrap/Button'
import { Trans } from 'react-i18next'
import { filterOneClickProviders } from '../../login-page/utils/filter-one-click-providers'
import { getOneClickProviderMetadata } from '../../login-page/one-click/get-one-click-provider-metadata'
import { usePathname } from 'next/navigation'

export type SignInButtonProps = Omit<ButtonProps, 'href'>

/**
 * Renders a sign-in button if auth providers are defined.
 * It links to either the login page or if only a single one-click provider is configured, to that one.
 *
 * @param variant The style variant as inferred from the common button component.
 * @param props Further props inferred from the common button component.
 */
export const SignInButton: React.FC<SignInButtonProps> = ({ variant, ...props }) => {
  const authProviders = useFrontendConfig().authProviders
  const pathname = usePathname()

  const loginLink = useMemo(() => {
    const oneClickProviders = filterOneClickProviders(authProviders)
    if (authProviders.length === 1 && oneClickProviders.length === 1) {
      const metadata = getOneClickProviderMetadata(oneClickProviders[0])
      return metadata.url
    }
    return `/login?redirectBackTo=${pathname}`
  }, [authProviders, pathname])
  const buttonTitle = useTranslatedText('login.signIn')

  if (authProviders.length === 0) {
    return null
  }

  return (
    <Link href={loginLink} passHref={true}>
      <Button title={buttonTitle} {...cypressId('sign-in-button')} variant={variant || 'success'} {...props}>
        <Trans i18nKey='login.signIn' />
      </Button>
    </Link>
  )
}
