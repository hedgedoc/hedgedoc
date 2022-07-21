/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from './external-link'
import type { TranslatedLinkProps } from './types'

/**
 * An {@link ExternalLink external link} with translated text.
 *
 * @param i18nKey The key of the translation
 * @param i18nOption The translation options
 * @param props Additional props directly given to the {@link ExternalLink}
 */
export const TranslatedExternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, i18nOption, ...props }) => {
  const { t } = useTranslation()
  return <ExternalLink text={t(i18nKey, i18nOption)} {...props} />
}
