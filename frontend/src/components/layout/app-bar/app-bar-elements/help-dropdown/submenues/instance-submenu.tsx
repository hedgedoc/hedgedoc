/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DropdownHeader } from '../dropdown-header'
import { VersionInfoHelpMenuEntry } from './instance/version-info-help-menu-entry'
import React, { Fragment } from 'react'
import { MotdModalHelpMenuEntry } from './instance/motd-modal-help-menu-entry'

/**
 * Renders the instance submenu for the help dropdown.
 */
export const InstanceSubmenu: React.FC = () => {
  return (
    <Fragment>
      <DropdownHeader i18nKey={'appbar.help.instance.header'} />
      <VersionInfoHelpMenuEntry />
      <MotdModalHelpMenuEntry />
    </Fragment>
  )
}
