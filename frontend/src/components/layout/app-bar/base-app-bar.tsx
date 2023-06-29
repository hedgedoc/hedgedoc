/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NewNoteButton } from '../../common/new-note-button/new-note-button'
import { SettingsButton } from '../../global-dialogs/settings-dialog/settings-button'
import { BrandingElement } from './app-bar-elements/branding-element'
import { HelpDropdown } from './app-bar-elements/help-dropdown/help-dropdown'
import { UserElement } from './app-bar-elements/user-element'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Col, Nav, Navbar } from 'react-bootstrap'

/**
 * Renders the base app bar with branding, help, settings user elements.
 */
export const BaseAppBar: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Navbar expand={true} className={'px-2 py-2 shadow-sm'}>
      <Col>
        <BrandingElement />
      </Col>
      <Col md={6} className={'h-100'}>
        <Nav className={'d-flex align-items-center justify-content-center h-100'}>{children}</Nav>
      </Col>
      <Col>
        <Nav className={'d-flex align-items-center justify-content-end gap-2'}>
          <HelpDropdown />
          <SettingsButton />
          <NewNoteButton />
          <UserElement />
        </Nav>
      </Col>
    </Navbar>
  )
}
