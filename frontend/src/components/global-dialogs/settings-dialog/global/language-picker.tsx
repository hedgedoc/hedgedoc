/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { Logger } from '../../../../utils/logger'
import { testId } from '../../../../utils/test-id'
import { availableLanguages } from './available-languages'
import { LanguageOption } from './language-option'
import React, { useCallback, useMemo } from 'react'
import { Form } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const log = new Logger('LanguagePicker')

/**
 * This function checks if the wanted language code is supported by our translations.
 * The language code that is provided by the browser can (but don't need to) contain the region.
 * Some of our translations are region dependent (e.g. chinese-traditional and chinese-simplified).
 * Therefore, we first need to check if the complete wanted language code is supported by our translations.
 * If not, then we look if we at least have a region independent translation.
 *
 * @param allLanguages all available languages as ISO-639-1 codes
 * @param wantedLanguage an ISO 639-1 standard language code
 * @return The supported language code
 */
const findLanguageCode = (allLanguages: string[], wantedLanguage: string): string =>
  allLanguages.find((supportedLanguage) => wantedLanguage === supportedLanguage) ??
  allLanguages.find((supportedLanguage) => wantedLanguage.slice(0, 2) === supportedLanguage) ??
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

  const allLanguages = useMemo(() => availableLanguages(), [])

  const languageCode = useMemo(() => findLanguageCode(allLanguages, i18n.language), [allLanguages, i18n.language])

  const languageOptions = useMemo(
    () => allLanguages.map((language) => <LanguageOption languageCode={language} key={language} />),
    [allLanguages]
  )

  return (
    <Form.Select
      as='select'
      className='w-auto'
      value={languageCode}
      onChange={onChangeLang}
      {...testId('language-picker')}
      {...cypressId('language-picker')}>
      {languageOptions}
    </Form.Select>
  )
}
