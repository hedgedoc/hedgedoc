/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DropdownHeader } from '../dropdown-header'
import { CheatsheetHelpMenuEntry } from './help/cheatsheet-help-menu-entry'
import { ShortcutsHelpMenuEntry } from './help/shortcuts-help-menu-entry'
import React, { Fragment } from 'react'

/**
 * Renders the help submenu for the help dropdown.
 */
export const HelpSubmenu: React.FC = () => {
  return (
    <Fragment>
      <DropdownHeader i18nKey={'appbar.help.help.header'} />
      <ShortcutsHelpMenuEntry />
      <CheatsheetHelpMenuEntry />
    </Fragment>
  )
}
