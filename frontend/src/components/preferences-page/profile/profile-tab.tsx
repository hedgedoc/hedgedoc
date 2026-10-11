'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Trans } from 'react-i18next'
import { DisplayNameSection } from './display-name-section'
import { AvatarSection } from './avatar-section'

/**
 * Shows the public profile preferences.
 */
export const ProfileTab: React.FC = () => (
  <Fragment>
    <h2 className={'mb-3 h4'}>
      <Trans i18nKey='preferences.profile.title' />
    </h2>
    <p>
      <Trans i18nKey={'preferences.profile.info'} />
    </p>
    <DisplayNameSection />
    <AvatarSection />
  </Fragment>
)
