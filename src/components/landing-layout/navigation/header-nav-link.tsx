/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import { cypressId } from '../../../utils/cypress-attribute'

export interface HeaderNavLinkProps extends PropsWithDataCypressId {
  to: string
}

export const HeaderNavLink: React.FC<HeaderNavLinkProps> = ({ to, children, ...props }) => {
  return (
    <Nav.Item>
      <LinkContainer to={to}>
        <Nav.Link className='text-light' href={to} {...cypressId(props)}>
          {children}
        </Nav.Link>
      </LinkContainer>
    </Nav.Item>
  )
}
