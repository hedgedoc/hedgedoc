/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { Settings } from 'luxon'
import { initReactI18next } from 'react-i18next'

export const setUpI18n = async (): Promise<void> => {
  await i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: true,
      backend: {
        loadPath: '/locales/{{lng}}.json'
      },

      interpolation: {
        escapeValue: false // not needed for react as it escapes by default
      }
    })

  Settings.defaultLocale = i18n.language
}
