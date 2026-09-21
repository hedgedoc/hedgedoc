/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren, ReactNode } from 'react'
import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'

export interface LoginLayoutProps extends PropsWithChildren {
  leftSide: ReactNode
}

/**
 * Layout for the login page with the intro content on the left and children on the right.
 * @param leftSide The content to show on the left (can be undefined to just render the default)
 * @param children The content to show on the right
 */
export const TwoColumnLayout: React.FC<LoginLayoutProps> = ({ leftSide, children }) => {
  return (
    <Container>
      <Row>
        <Col xs={8}>{leftSide}</Col>
        <Col xs={4} className={'pt-3 d-flex gap-3 flex-column'}>
          {children}
        </Col>
      </Row>
    </Container>
  )
}
