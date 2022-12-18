/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { InternalLink } from './internal-link'
import type { TranslatedLinkProps } from './types'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * An {@link InternalLink internal link} with translated text.
 *
 * @param i18nKey The key of the translation
 * @param i18nOption The translation options
 * @param props Additional props directly given to the {@link InternalLink}
 */
export const TranslatedInternalLink: React.FC<TranslatedLinkProps> = ({ i18nKey, i18nOption, ...props }) => {
  const { t } = useTranslation()
  const text = useMemo(() => (i18nOption ? t(i18nKey, i18nOption) : t(i18nKey)), [i18nKey, i18nOption, t])
  return <InternalLink text={text} {...props} />
}
