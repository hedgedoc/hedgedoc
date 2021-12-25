/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ResourceKey } from 'i18next'
import i18n, { use as i18nUse } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { Settings } from 'luxon'
import { initReactI18next } from 'react-i18next'

export const setUpI18n = async (): Promise<void> => {
  await i18nUse(
    resourcesToBackend((language, namespace, callback) => {
      import(`../../../../locales/${language}.json`)
        .then((resources: ResourceKey) => {
          callback(null, resources)
        })
        .catch((error: Error) => {
          callback(error, null)
        })
    })
  )
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV !== 'production',
      interpolation: {
        escapeValue: false
      }
    })

  Settings.defaultLocale = i18n.language
}
