/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ApplicationState } from '../../../redux'
import { ShowIf } from '../../common/show-if/show-if'
import { SignInButton } from '../../landing-layout/navigation/sign-in-button'
import './cover-buttons.scss'

export const CoverButtons: React.FC = () => {
  useTranslation()
  const userExists = useSelector((state: ApplicationState) => !!state.user)
  const anyAuthProviderActivated = useSelector((state: ApplicationState) => Object.values(state.config.authProviders).includes(true))

  if (userExists) {
    return null
  }

  return (
    <div className="mb-5">
      <SignInButton
        className="cover-button"
        variant="success"
        size="lg"
      />
      <ShowIf condition={anyAuthProviderActivated}>
        <span className="m-2">
          <Trans i18nKey="common.or"/>
        </span>
      </ShowIf>
      <Link to="/n/features">
        <Button
          className="cover-button"
          variant="primary"
          size="lg"
        >
          <Trans i18nKey="landing.intro.exploreFeatures"/>
        </Button>
      </Link>
    </div>
  )
}
