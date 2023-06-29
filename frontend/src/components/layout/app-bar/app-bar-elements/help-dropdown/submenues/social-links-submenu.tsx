/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import links from '../../../../../../links.json'
import { IconDiscourse } from '../../../../../common/icons/additional/icon-discourse'
import { IconMatrixOrg } from '../../../../../common/icons/additional/icon-matrix-org'
import { DropdownHeader } from '../dropdown-header'
import { TranslatedDropdownItem } from '../translated-dropdown-item'
import React, { Fragment } from 'react'
import { Mastodon as IconMastodon } from 'react-bootstrap-icons'

/**
 * Renders the social links submenu for the help dropdown.
 */
export const SocialLinksSubmenu: React.FC = () => {
  return (
    <Fragment>
      <DropdownHeader i18nKey={'appbar.help.social.header'} />
      <TranslatedDropdownItem
        i18nKey={'appbar.help.social.discourse'}
        icon={IconDiscourse}
        href={links.community}
        target={'_blank'}
      />
      <TranslatedDropdownItem
        i18nKey={'appbar.help.social.matrix'}
        icon={IconMatrixOrg}
        href={links.chat}
        target={'_blank'}
      />
      <TranslatedDropdownItem
        i18nKey={'appbar.help.social.mastodon'}
        icon={IconMastodon}
        href={links.mastodon}
        target={'_blank'}
      />
    </Fragment>
  )
}
