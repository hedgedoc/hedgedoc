/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { InternalLink } from './internal-link'
import type { TranslatedLinkProps } from './types'
import React from 'react'

/**
 * An {@link InternalLink internal link} with translated text.
 *
 * @param i18nKey The key of the translation
 * @param i18nOption The translation options
 * @param props Additional props directly given to the {@link InternalLink}
 */
export const TranslatedInternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, i18nOption, ...props }) => {
  const text = useTranslatedText(i18nKey, i18nOption)

  return <InternalLink text={text} {...props} />
}
