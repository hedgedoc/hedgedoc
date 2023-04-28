/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { Logger } from '../../../../utils/logger'
import { Settings } from 'luxon'
import React, { useCallback, useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const log = new Logger('LanguagePicker')
const languages = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  es: 'Español',
  ca: 'Català',
  el: 'Ελληνικά',
  pt: 'Português',
  it: 'Italiano',
  tr: 'Türkçe',
  ru: 'Русский',
  nl: 'Nederlands',
  hr: 'Hrvatski',
  pl: 'Polski',
  uk: 'Українська',
  hi: 'हिन्दी',
  sv: 'Svenska',
  eo: 'Esperanto',
  da: 'Dansk',
  ko: '한국어',
  id: 'Bahasa Indonesia',
  sr: 'Cрпски',
  vi: 'Tiếng Việt',
  ar: 'العربية',
  cs: 'Česky',
  sk: 'Slovensky'
}

/**
 * This function checks if the wanted language code is supported by our translations.
 * The language code that is provided by the browser can (but don't need to) contain the region.
 * Some of our translations are region dependent (e.g. chinese-traditional and chinese-simplified).
 * Therefore, we first need to check if the complete wanted language code is supported by our translations.
 * If not, then we look if we at least have a region independent translation.
 *
 * @param wantedLanguage an ISO 639-1 standard language code
 * @return The supported language code
 */
const findLanguageCode = (wantedLanguage: string): string =>
  Object.keys(languages).find((supportedLanguage) => wantedLanguage === supportedLanguage) ??
  Object.keys(languages).find((supportedLanguage) => wantedLanguage.slice(0, 2) === supportedLanguage) ??
  ''

/**
 * Renders the language picker.
 */
export const LanguagePicker: React.FC = () => {
  const { i18n } = useTranslation()

  const onChangeLang = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      i18n
        .changeLanguage(event.currentTarget.value)
        .catch((error: Error) => log.error('Error while switching language', error))
    },
    [i18n]
  )

  const languageCode = useMemo(() => findLanguageCode(i18n.language), [i18n.language])

  const languageOptions = useMemo(
    () =>
      Object.entries(languages).map(([language, languageName]) => (
        <option key={language} value={language}>
          {languageName}
        </option>
      )),
    []
  )

  return (
    <Form.Select
      as='select'
      className='w-auto'
      value={languageCode}
      onChange={onChangeLang}
      {...cypressId('language-picker')}>
      {languageOptions}
    </Form.Select>
  )
}
