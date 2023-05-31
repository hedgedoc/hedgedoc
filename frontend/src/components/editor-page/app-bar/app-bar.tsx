/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useOutlineButtonVariant } from '../../../hooks/dark-mode/use-outline-button-variant'
import { NewNoteButton } from '../../common/new-note-button/new-note-button'
import { ShowIf } from '../../common/show-if/show-if'
import { SignInButton } from '../../landing-layout/navigation/sign-in-button'
import { UserDropdown } from '../../landing-layout/navigation/user-dropdown'
import { SettingsButton } from '../../layout/settings-dialog/settings-button'
import { CheatsheetButton } from './cheatsheet/cheatsheet-button'
import { HelpButton } from './help-button/help-button'
import { NavbarBranding } from './navbar-branding'
import { ReadOnlyModeButton } from './read-only-mode-button'
import { SlideModeButton } from './slide-mode-button'
import { NoteType } from '@hedgedoc/commons'
import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'

export enum AppBarMode {
  BASIC,
  EDITOR
}

export interface AppBarProps {
  mode: AppBarMode
}

/**
 * Renders the app bar.
 *
 * @param mode Which mode the app bar should be rendered in. This mainly adds / removes buttons for the editor.
 */
export const AppBar: React.FC<AppBarProps> = ({ mode }) => {
  const userExists = useApplicationState((state) => !!state.user)
  const noteFrontmatter = useApplicationState((state) => state.noteDetails.frontmatter)
  const buttonVariant = useOutlineButtonVariant()

  return (
    <Navbar expand={true} className={'px-3'}>
      <Nav className='me-auto d-flex align-items-center'>
        <NavbarBranding />
        <ShowIf condition={mode === AppBarMode.EDITOR}>
          <ShowIf condition={noteFrontmatter.type === NoteType.SLIDE}>
            <SlideModeButton />
          </ShowIf>
          <ShowIf condition={noteFrontmatter.type !== NoteType.SLIDE}>
            <ReadOnlyModeButton />
          </ShowIf>
          <HelpButton />
          <CheatsheetButton />
        </ShowIf>
      </Nav>
      <Nav className='d-flex gap-2 align-items-center text-secondary justify-content-end'>
        <SettingsButton variant={buttonVariant} />
        <NewNoteButton />
        <ShowIf condition={!userExists}>
          <SignInButton size={'sm'} />
        </ShowIf>
        <ShowIf condition={userExists}>
          <UserDropdown />
        </ShowIf>
      </Nav>
    </Navbar>
  )
}
