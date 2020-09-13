import React from 'react'
import { Container } from 'react-bootstrap'
import { DocumentTitle } from '../common/document-title/document-title'
import { Footer } from './footer/footer'
import { MotdBanner } from '../common/motd-banner/motd-banner'
import { HeaderBar } from './navigation/header-bar/header-bar'

export const LandingLayout: React.FC = ({ children }) => {
  return (
    <Container className="text-light d-flex flex-column mvh-100">
      <DocumentTitle/>
      <MotdBanner/>
      <HeaderBar/>
      <div className={'d-flex flex-column justify-content-between flex-fill text-center'}>
        <div>
          {children}
        </div>
        <Footer/>
      </div>
    </Container>
  )
}
