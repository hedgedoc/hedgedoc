/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TOptions } from 'i18next'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Translates text and caches it.
 *
 * @param key The translation key
 * @param tOptions Optional translation options
 * @return the translated text
 */
export const useTranslatedText = (key: string, tOptions?: TOptions): string => {
  const { t } = useTranslation()
  return useMemo(() => (tOptions ? t(key, tOptions) : t(key)), [key, tOptions, t])
}
