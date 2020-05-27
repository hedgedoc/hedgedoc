import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import React from 'react'

export interface HeaderNavLinkProps {
  to: string
}

export const HeaderNavLink: React.FC<HeaderNavLinkProps> = (props) => {
  return (
    <Nav.Item>
      <LinkContainer to={props.to}>
        <Nav.Link className="text-light" href={props.to}>{props.children}</Nav.Link>
      </LinkContainer>
    </Nav.Item>
  )
}
