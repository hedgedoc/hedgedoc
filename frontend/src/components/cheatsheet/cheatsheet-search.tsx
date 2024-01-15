/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { allAppExtensions } from '../../extensions/all-app-extensions'
import { useCheatsheetSearch } from '../../hooks/common/use-cheatsheet-search'
import { useOnInputChange } from '../../hooks/common/use-on-input-change'
import { useTranslatedText } from '../../hooks/common/use-translated-text'
import { UiIcon } from '../common/icons/ui-icon'
import type { CheatsheetExtension } from './cheatsheet-extension'
import { isCheatsheetMultiEntry } from './cheatsheet-extension'
import styles from './cheatsheet.module.scss'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import { X } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

export interface CheatsheetSearchProps {
  setVisibleExtensions: React.Dispatch<React.SetStateAction<CheatsheetExtension[]>>
}

/**
 * Renders a search field and handles the extension selection to display.
 * An empty search input leads to all extensions being set.
 *
 * @param setVisibleExtensions This sets the extensions that are displayed in the cheatsheet view.
 */
export const CheatsheetSearch: React.FC<CheatsheetSearchProps> = ({ setVisibleExtensions }) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const allCheatsheetExtensions = useMemo(
    () => allAppExtensions.flatMap((extension) => extension.buildCheatsheetExtensions()),
    []
  )
  const placeholderText = useTranslatedText('cheatsheet.search')

  const buildEntry = useCallback(
    (i18nKey: string, extensionId: string) => {
      return {
        id: i18nKey,
        extensionId: extensionId,
        title: t(`cheatsheet.${i18nKey}.title`),
        description: t(`cheatsheet.${i18nKey}.description`),
        example: t(`cheatsheet.${i18nKey}.example`)
      }
    },
    [t]
  )

  const cheatsheetSearchIndexEntries = useMemo(
    () =>
      allCheatsheetExtensions.flatMap((extension) => {
        if (isCheatsheetMultiEntry(extension)) {
          return extension.topics.map((entry) => {
            return buildEntry(extension.i18nKey + '.' + entry.i18nKey, extension.i18nKey)
          })
        } else {
          return buildEntry(extension.i18nKey, extension.i18nKey)
        }
      }),
    [allCheatsheetExtensions, buildEntry]
  )

  const searchResults = useCheatsheetSearch(cheatsheetSearchIndexEntries, searchTerm)
  useEffect(() => {
    const extensionResults = allCheatsheetExtensions.filter((extension) => {
      return (
        searchResults.find((result) => {
          return result.extensionId === extension.i18nKey
        }) !== undefined
      )
    })
    setVisibleExtensions(extensionResults)
  }, [allCheatsheetExtensions, searchResults, searchTerm, setVisibleExtensions])
  const onChange = useOnInputChange(setSearchTerm)
  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [setSearchTerm])

  return (
    <InputGroup className='mb-3'>
      <FormControl placeholder={placeholderText} aria-label={placeholderText} onChange={onChange} value={searchTerm} />
      <button className={styles.innerBtn} onClick={clearSearch}>
        <UiIcon icon={X} />
      </button>
    </InputGroup>
  )
}
