/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { ExternalLink } from './external-link'
import type { TranslatedLinkProps } from './types'
import React from 'react'

/**
 * An {@link ExternalLink external link} with translated text.
 *
 * @param i18nKey The key of the translation
 * @param i18nOption The translation options
 * @param props Additional props directly given to the {@link ExternalLink}
 */
export const TranslatedExternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, i18nOption, ...props }) => {
  const text = useTranslatedText(i18nKey, i18nOption)
  return <ExternalLink text={text} {...props} />
}
