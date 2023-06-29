/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { HeaderNavLink } from './header-nav-link'
import React from 'react'
import { Navbar } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a header bar for the intro and history page.
 */
const HeaderBar: React.FC = () => {
  useTranslation()

  return (
    <Navbar className='justify-content-between'>
      <div className='nav'>
        <HeaderNavLink to='/intro' {...cypressId('navLinkIntro')}>
          <Trans i18nKey='landing.navigation.intro' />
        </HeaderNavLink>
        <HeaderNavLink to='/history' {...cypressId('navLinkHistory')}>
          <Trans i18nKey='landing.navigation.history' />
        </HeaderNavLink>
      </div>
    </Navbar>
  )
}

export { HeaderBar }
