/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import links from '../../../../../../links.json'
import { DropdownHeader } from '../dropdown-header'
import { TranslatedDropdownItem } from '../translated-dropdown-item'
import React, { Fragment } from 'react'
import { Flag as IconFlag, Tag as IconTag, Github as IconGithub } from 'react-bootstrap-icons'

/**
 * Renders the project links submenu for the help dropdown.
 */
export const ProjectLinksSubmenu: React.FC = () => {
  return (
    <Fragment>
      <DropdownHeader i18nKey={'appbar.help.project.header'} />
      <TranslatedDropdownItem
        i18nKey={'appbar.help.project.github'}
        icon={IconGithub}
        href={links.githubOrg}
        target={'_blank'}
      />
      <TranslatedDropdownItem
        i18nKey={'appbar.help.project.reportIssue'}
        icon={IconTag}
        href={links.issues}
        target={'_blank'}
      />
      <TranslatedDropdownItem
        i18nKey={'appbar.help.project.helpTranslating'}
        icon={IconFlag}
        href={links.translate}
        target={'_blank'}
      />
    </Fragment>
  )
}
