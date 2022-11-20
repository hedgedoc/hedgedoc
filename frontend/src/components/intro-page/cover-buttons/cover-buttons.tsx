/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { ShowIf } from '../../common/show-if/show-if'
import { SignInButton } from '../../landing-layout/navigation/sign-in-button'
import './cover-buttons.module.scss'
import { cypressId } from '../../../utils/cypress-attribute'
import Link from 'next/link'

export const CoverButtons: React.FC = () => {
  useTranslation()
  const userExists = useApplicationState((state) => !!state.user)
  const anyAuthProviderActivated = useApplicationState((state) => state.config.authProviders.length > 0)

  if (userExists) {
    return null
  }

  return (
    <div className='mb-5'>
      <SignInButton className='cover-button' variant='success' size='lg' />
      <ShowIf condition={anyAuthProviderActivated}>
        <span className='m-2'>
          <Trans i18nKey='common.or' />
        </span>
      </ShowIf>
      <Link href='/n/features' passHref={true}>
        <Button {...cypressId('features-button')} className='cover-button' variant='primary' size='lg'>
          <Trans i18nKey='landing.intro.exploreFeatures' />
        </Button>
      </Link>
    </div>
  )
}
