import React, { Fragment } from 'react'
import { Navbar } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { HeaderNavLink } from '../header-nav-link'
import { NewGuestNoteButton } from '../new-guest-note-button'
import { NewUserNoteButton } from '../new-user-note-button'
import { SignInButton } from '../sign-in-button'
import { UserDropdown } from '../user-dropdown/user-dropdown'
import './header-bar.scss'

const HeaderBar: React.FC = () => {
  useTranslation()
  const user = useSelector((state: ApplicationState) => state.user)

  return (
    <Navbar className="justify-content-between">
      <div className="nav header-nav">
        <HeaderNavLink to="/intro">
          <Trans i18nKey="landing.navigation.intro"/>
        </HeaderNavLink>
        <HeaderNavLink to="/history">
          <Trans i18nKey="landing.navigation.history"/>
        </HeaderNavLink>
      </div>
      <div className="d-inline-flex">
        {!user
          ? <Fragment>
            <span className={'mr-1 d-flex'}>
              <NewGuestNoteButton/>
            </span>
            <SignInButton/>
          </Fragment>
          : <Fragment>
            <span className={'mr-1 d-flex'}>
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
