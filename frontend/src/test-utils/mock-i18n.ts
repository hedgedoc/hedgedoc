/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

/**
 * Initializes i18n with minimal settings and without any data, so it just returns the used key as translation.
 *
 * @return A promise that resolves if i18n has been initialized
 */
export const mockI18n = (): Promise<TFunction> => {
  return i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['translationsNS'],
    defaultNS: 'translationsNS',
    interpolation: {
      escapeValue: false
    },
    resources: { en: { translationsNS: {} } }
  })
}
