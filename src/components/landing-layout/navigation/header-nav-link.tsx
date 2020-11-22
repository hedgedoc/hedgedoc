/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

export interface HeaderNavLinkProps {
  to: string
  id: string
}

export const HeaderNavLink: React.FC<HeaderNavLinkProps> = ({ to, id, children }) => {
  return (
    <Nav.Item>
      <LinkContainer to={to}>
        <Nav.Link id={id} className="text-light" href={to}>{children}</Nav.Link>
      </LinkContainer>
    </Nav.Item>
  )
}
