/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Container } from 'react-bootstrap'

/**
 * Renders the layout for both intro and history page.
 *
 * @param children The children that should be rendered on the page.
 */
export const LandingLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container>
      <div className={'d-flex flex-column justify-content-between flex-fill text-center'}>
        <main>{children}</main>
      </div>
    </Container>
  )
}
