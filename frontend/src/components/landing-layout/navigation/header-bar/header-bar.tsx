/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { NewNoteButton } from '../../../common/new-note-button/new-note-button'
import { SettingsButton } from '../../../global-dialogs/settings-dialog/settings-button'
import { SignInButton } from '../sign-in-button'
import { UserDropdown } from '../user-dropdown'
import { HeaderNavLink } from './header-nav-link'
import React from 'react'
import { Navbar } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a header bar for the intro and history page.
 */
const HeaderBar: React.FC = () => {
  useTranslation()
  const userExists = useApplicationState((state) => !!state.user)

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
      <div className='d-inline-flex gap-2'>
        <SettingsButton variant={'outline-dark'} />
        <NewNoteButton />
        {!userExists ? <SignInButton size='sm' /> : <UserDropdown />}
      </div>
    </Navbar>
  )
}

export { HeaderBar }
