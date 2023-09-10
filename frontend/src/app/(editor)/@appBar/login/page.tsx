'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import styles from '../../../../components/layout/app-bar/navbar.module.scss'
import { HelpDropdown } from '../../../../components/layout/app-bar/app-bar-elements/help-dropdown/help-dropdown'
import { SettingsButton } from '../../../../components/global-dialogs/settings-dialog/settings-button'
import { BrandingElement } from '../../../../components/layout/app-bar/app-bar-elements/branding-element'

export default function AppBar() {
  return (
    <Navbar expand={true} className={`px-2 py-1 align-items-center ${styles.navbar}`}>
      <Nav className={`align-items-center justify-content-start gap-2 flex-grow-1 ${styles.side}`}>
        <BrandingElement />
      </Nav>
      <Nav className={`align-items-stretch justify-content-end flex-grow-1 ${styles.side} h-100 py-1`}>
        <div className={'d-flex gap-2'}>
          <HelpDropdown />
          <SettingsButton />
        </div>
      </Nav>
    </Navbar>
  )
}
