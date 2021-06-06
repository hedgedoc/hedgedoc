/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { Settings } from 'luxon'
import { initReactI18next } from 'react-i18next'

export const setUpI18n = async (frontendAssetsUrl: string): Promise<void> => {
  await i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV !== 'production',
      backend: {
        loadPath: `${frontendAssetsUrl}locales/{{lng}}.json`
      },

      interpolation: {
        escapeValue: false
      }
    })

  Settings.defaultLocale = i18n.language
}
