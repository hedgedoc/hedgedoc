/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ShowIf } from '../../../../../common/show-if/show-if'
import { DropdownHeader } from '../dropdown-header'
import { TranslatedDropdownItem } from '../translated-dropdown-item'
import type { ReactElement } from 'react'
import React, { Fragment } from 'react'
import { Dropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useFrontendConfig } from '../../../../../common/frontend-config-context/use-frontend-config'

/**
 * Renders the legal submenu for the help dropdown.
 */
export const LegalSubmenu: React.FC = (): null | ReactElement => {
  useTranslation()
  const specialUrls = useFrontendConfig().specialUrls

  const linksConfigured = specialUrls?.privacy || specialUrls?.termsOfUse || specialUrls?.imprint

  if (!linksConfigured) {
    return null
  }

  return (
    <Fragment>
      <Dropdown.Divider />
      <DropdownHeader i18nKey={'appbar.help.legal.header'} />
      <ShowIf condition={!!specialUrls.privacy}>
        <TranslatedDropdownItem href={specialUrls.privacy} i18nKey={'appbar.help.legal.privacy'} />
      </ShowIf>
      <ShowIf condition={!!specialUrls.termsOfUse}>
        <TranslatedDropdownItem href={specialUrls.termsOfUse} i18nKey={'appbar.help.legal.termsOfUse'} />
      </ShowIf>
      <ShowIf condition={!!specialUrls.imprint}>
        <TranslatedDropdownItem href={specialUrls.imprint} i18nKey={'appbar.help.legal.imprint'} />
      </ShowIf>
    </Fragment>
  )
}
