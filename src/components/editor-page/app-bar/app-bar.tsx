/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { ShowIf } from '../../common/show-if/show-if'
import { SignInButton } from '../../landing-layout/navigation/sign-in-button'
import { UserDropdown } from '../../landing-layout/navigation/user-dropdown'
import { DarkModeButton } from './dark-mode-button'
import { EditorViewMode } from './editor-view-mode'
import { HelpButton } from './help-button/help-button'
import { NavbarBranding } from './navbar-branding'
import { SyncScrollButtons } from './sync-scroll-buttons/sync-scroll-buttons'
import { SlideModeButton } from './slide-mode-button'
import { ReadOnlyModeButton } from './read-only-mode-button'
import { NewNoteButton } from './new-note-button'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { NoteType } from '../../../redux/note-details/types/note-details'

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

  return (
    <Navbar expand={true} className={'bg-light px-3'}>
      <Nav className='me-auto d-flex align-items-center'>
        <NavbarBranding />
        <ShowIf condition={mode === AppBarMode.EDITOR}>
          <EditorViewMode />
          <SyncScrollButtons />
        </ShowIf>
        <DarkModeButton />
        <ShowIf condition={mode === AppBarMode.EDITOR}>
          <ShowIf condition={noteFrontmatter.type === NoteType.SLIDE}>
            <SlideModeButton />
          </ShowIf>
          <ShowIf condition={noteFrontmatter.type !== NoteType.SLIDE}>
            <ReadOnlyModeButton />
          </ShowIf>
          <HelpButton />
        </ShowIf>
      </Nav>
      <Nav className='d-flex align-items-center text-secondary justify-content-end'>
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
