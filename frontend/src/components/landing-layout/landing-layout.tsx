/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MotdModal } from '../common/motd-modal/motd-modal'
import { Footer } from './footer/footer'
import { HeaderBar } from './navigation/header-bar/header-bar'
import type { PropsWithChildren } from 'react'
import React, { Fragment } from 'react'
import { Container } from 'react-bootstrap'

/**
 * Renders the layout for both intro and history page.
 *
 * @param children The children that should be rendered on the page.
 */
export const LandingLayout: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <Fragment>
      <MotdModal />
      <Container className='text-light d-flex flex-column mvh-100'>
        <HeaderBar />
        <div className={'d-flex flex-column justify-content-between flex-fill text-center'}>
          <main>{children}</main>
          <Footer />
        </div>
      </Container>
    </Fragment>
  )
}
