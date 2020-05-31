import React from 'react'
import { Container } from 'react-bootstrap'
import { HeaderBar } from './layout/navigation/header-bar/header-bar'
import { Footer } from './layout/footer/footer'
import './layout/style/index.scss'

export const LandingLayout: React.FC = ({ children }) => {
  return (
    <Container className="text-center text-white">
      <HeaderBar/>
      {children}
      <Footer/>
    </Container>
  )
}
