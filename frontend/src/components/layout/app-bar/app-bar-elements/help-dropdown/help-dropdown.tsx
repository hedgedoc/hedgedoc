/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../../../common/icons/ui-icon'
import { HelpSubmenu } from './submenues/help-submenu'
import { InstanceSubmenu } from './submenues/instance-submenu'
import { LegalSubmenu } from './submenues/legal-submenu'
import { ProjectLinksSubmenu } from './submenues/project-links-submenu'
import { SocialLinksSubmenu } from './submenues/social-links-submenu'
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { QuestionLg as IconQuestion } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Renders the help dropdown in the app bar.
 */
export const HelpDropdown: React.FC = () => {
  useTranslation()

  return (
    <Dropdown drop={'start'}>
      <Dropdown.Toggle size={'sm'} className={'h-100'}>
        <UiIcon icon={IconQuestion} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <HelpSubmenu />
        <Dropdown.Divider />
        <InstanceSubmenu />
        <LegalSubmenu />
        <Dropdown.Divider />
        <ProjectLinksSubmenu />
        <Dropdown.Divider />
        <SocialLinksSubmenu />
      </Dropdown.Menu>
    </Dropdown>
  )
}
