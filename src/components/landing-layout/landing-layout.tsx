/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Container } from 'react-bootstrap'
import { useDocumentTitle } from '../../hooks/common/use-document-title'
import { MotdBanner } from '../common/motd-banner/motd-banner'
import { Footer } from './footer/footer'
import { HeaderBar } from './navigation/header-bar/header-bar'
import { UiNotifications } from '../notifications/ui-notifications'

export const LandingLayout: React.FC = ({ children }) => {
  useDocumentTitle()

  return (
    <Fragment>
      <UiNotifications/>
      <Container className="text-light d-flex flex-column mvh-100">
        <MotdBanner/>
        <HeaderBar/>
        <div className={ 'd-flex flex-column justify-content-between flex-fill text-center' }>
          <main>
            { children }
          </main>
          <Footer/>
        </div>
      </Container>
    </Fragment>
  )
}
