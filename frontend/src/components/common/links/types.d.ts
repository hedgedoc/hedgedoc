/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IconName } from '../fork-awesome/fork-awesome-icon'
import type { TOptions } from 'i18next'

interface GeneralLinkProp {
  href: string
  icon?: IconName
  id?: string
  className?: string
  title?: string
}

export interface LinkWithTextProps extends GeneralLinkProp {
  text: string
}

export interface TranslatedLinkProps extends GeneralLinkProp {
  i18nKey: string
  i18nOption?: TOptions
}
