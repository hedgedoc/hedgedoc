import React from 'react'
import { Container } from 'react-bootstrap'
import { Footer } from './layout/footer/footer'
import { InfoBanner } from './layout/info-banner'
import { HeaderBar } from './layout/navigation/header-bar/header-bar'

export const LandingLayout: React.FC = ({ children }) => {
  return (
    <Container className="text-white d-flex flex-column mvh-100">
      <InfoBanner/>
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
