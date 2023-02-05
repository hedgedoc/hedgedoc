/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TOptionsBase } from 'i18next'
import type { Icon } from 'react-bootstrap-icons'

interface GeneralLinkProp {
  href: string
  icon?: Icon
  id?: string
  className?: string
  title?: string
}

export interface LinkWithTextProps extends GeneralLinkProp {
  text: string
}

export interface TranslatedLinkProps extends GeneralLinkProp {
  i18nKey: string
  i18nOption?: TOptionsBase & Record<string, unknown>
}
