/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Container } from 'react-bootstrap'
import { useDocumentTitle } from '../../hooks/common/use-document-title'
import { MotdBanner } from '../common/motd-banner/motd-banner'
import { Footer } from './footer/footer'
import { HeaderBar } from './navigation/header-bar/header-bar'

export const LandingLayout: React.FC = ({ children }) => {
  useDocumentTitle()

  return (
    <Container className="text-light d-flex flex-column mvh-100">
      <MotdBanner/>
      <HeaderBar/>
      <div className={ 'd-flex flex-column justify-content-between flex-fill text-center' }>
        <div>
          { children }
        </div>
        <Footer/>
      </div>
    </Container>
  )
}
