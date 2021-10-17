/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from './external-link'
import type { TranslatedLinkProps } from './types'

export const TranslatedExternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, i18nOption, ...props }) => {
  const { t } = useTranslation()
  return <ExternalLink text={t(i18nKey, i18nOption)} {...props} />
}
