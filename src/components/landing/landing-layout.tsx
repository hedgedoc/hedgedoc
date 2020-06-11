import React from 'react'
import { Container } from 'react-bootstrap'
import { HeaderBar } from './layout/navigation/header-bar/header-bar'
import { Footer } from './layout/footer/footer'

export const LandingLayout: React.FC = ({ children }) => {
  return (
    <Container className="text-white text-center">
      <HeaderBar/>
      {children}
      <Footer/>
    </Container>
  )
}
