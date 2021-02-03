/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Navbar } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import { HeaderNavLink } from '../header-nav-link'
import { NewGuestNoteButton } from '../new-guest-note-button'
import { NewUserNoteButton } from '../new-user-note-button'
import { SignInButton } from '../sign-in-button'
import { UserDropdown } from '../user-dropdown'
import './header-bar.scss'

const HeaderBar: React.FC = () => {
  useTranslation()
  const userExists = useSelector((state: ApplicationState) => !!state.user)

  return (
    <Navbar className="justify-content-between">
      <div className="nav header-nav">
        <HeaderNavLink to="/intro" id='navLinkIntro'>
          <Trans i18nKey="landing.navigation.intro"/>
        </HeaderNavLink>
        <HeaderNavLink to="/history" id='navLinkHistory'>
          <Trans i18nKey="landing.navigation.history"/>
        </HeaderNavLink>
      </div>
      <div className="d-inline-flex">
        { !userExists
          ? <Fragment>
              <span className={ 'mx-1 d-flex' }>
                <NewGuestNoteButton/>
              </span>
            <SignInButton size="sm"/>
          </Fragment>
          : <Fragment>
              <span className={ 'mx-1 d-flex' }>
                <NewUserNoteButton/>
              </span>
            <UserDropdown/>
          </Fragment>
        }
      </div>
    </Navbar>
  )
}

export { HeaderBar }
