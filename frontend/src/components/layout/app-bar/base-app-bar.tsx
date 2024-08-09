'use client'

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
import styles from './navbar.module.scss'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { cypressId } from '../../../utils/cypress-attribute'

export interface BaseAppBarProps {
  additionalContentLeft?: React.ReactNode
}

/**
 * Renders the base app bar with branding, help, settings user elements.
 */
export const BaseAppBar: React.FC<PropsWithChildren<BaseAppBarProps>> = ({ children, additionalContentLeft }) => {
  return (
    <Navbar
      expand={true}
      className={`px-2 py-1 align-items-center border-bottom ${styles.navbar}`}
      {...cypressId('base-app-bar')}>
      <Nav className={`align-items-center justify-content-start gap-2 flex-grow-1 ${styles.side}`}>
        <BrandingElement />
        {additionalContentLeft}
      </Nav>
      <Nav className={`align-items-center flex-fill overflow-hidden px-4 ${styles.center}`}>{children}</Nav>
      <Nav className={`align-items-stretch justify-content-end flex-grow-1 ${styles.side} h-100 py-1`}>
        <div className={'d-flex gap-2'}>
          <HelpDropdown />
          <SettingsButton />
          <NewNoteButton />
          <UserElement />
        </div>
      </Nav>
    </Navbar>
  )
}
