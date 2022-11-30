/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { SettingsButton } from '../../../layout/settings-dialog/settings-button'
import { NewGuestNoteButton } from '../new-guest-note-button'
import { NewUserNoteButton } from '../new-user-note-button'
import { SignInButton } from '../sign-in-button'
import { UserDropdown } from '../user-dropdown'
import { HeaderNavLink } from './header-nav-link'
import React, { Fragment } from 'react'
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
      <div className='d-inline-flex'>
        <SettingsButton className={'p-1 mx-2'} variant={'outline-light'} />
        {!userExists ? (
          <Fragment>
            <span className={'mx-1 d-flex'}>
              <NewGuestNoteButton />
            </span>
            <SignInButton size='sm' />
          </Fragment>
        ) : (
          <Fragment>
            <span className={'mx-1 d-flex'}>
              <NewUserNoteButton />
            </span>
            <UserDropdown />
          </Fragment>
        )}
      </div>
    </Navbar>
  )
}

export { HeaderBar }
