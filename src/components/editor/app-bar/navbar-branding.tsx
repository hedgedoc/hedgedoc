import React from 'react'
import { Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Branding } from '../../common/branding/branding'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

export const NavbarBranding: React.FC = () => {
  return (
    <Navbar.Brand>
      <Link to="/intro" className="text-secondary text-decoration-none d-flex align-items-center">
        <ForkAwesomeIcon icon="file-text" className={'mr-2'}/>
        <span>HedgeDoc</span>
        <Branding inline={true}/>
      </Link>
    </Navbar.Brand>
  )
}
