'use client'

/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Container } from 'react-bootstrap'
import { Welcome } from '../../../components/explore-page/welcome'
import { ModeSelection } from '../../../components/explore-page/mode-selection/mode-selection'
import { PinnedNotes } from '../../../components/explore-page/pinned-notes/pinned-notes'

/**
 * Layout for the login page with the intro content on the left and children on the right.
 * @param children The content to show on the right
 */

export type ExploreLayoutProps = PropsWithChildren

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return (
    <Container>
      <Welcome />
      <PinnedNotes />
      <ModeSelection />
      {children}
    </Container>
  )
}
