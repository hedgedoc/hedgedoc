/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { allAppExtensions } from '../../../../extensions/all-app-extensions'
import type { SearchIndexEntry } from '../../../../hooks/common/use-document-search'
import { useDocumentSearch } from '../../../../hooks/common/use-document-search'
import { useOnInputChange } from '../../../../hooks/common/use-on-input-change'
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../common/icons/ui-icon'
import type { CheatsheetSingleEntry, CheatsheetExtension } from '../../cheatsheet/cheatsheet-extension'
import { hasCheatsheetTopics } from '../../cheatsheet/cheatsheet-extension'
import styles from './cheatsheet.module.scss'
import type { IndexOptionsForDocumentSearch } from 'flexsearch-ts'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FormControl, InputGroup } from 'react-bootstrap'
import { X } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

interface CheatsheetSearchIndexEntry extends SearchIndexEntry {
  title: string
  description: string
  example: string
}

const searchOptions: IndexOptionsForDocumentSearch<CheatsheetSearchIndexEntry> = {
  document: {
    id: 'id',
    field: ['title', 'description', 'example']
  }
}

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
  const buildSearchIndexEntry = useCallback(
    (entry: CheatsheetSingleEntry, rootI18nKey: string | undefined = undefined): CheatsheetSearchIndexEntry => {
      const rootI18nKeyWithDot = rootI18nKey ? `${rootI18nKey}.` : ''
      return {
        id: rootI18nKey ? rootI18nKey : entry.i18nKey,
        title: t(`cheatsheet.${rootI18nKeyWithDot}${entry.i18nKey}.title`),
        description: t(`cheatsheet.${rootI18nKeyWithDot}${entry.i18nKey}.description`),
        example: t(`cheatsheet.${rootI18nKeyWithDot}${entry.i18nKey}.example`)
      }
    },
    [t]
  )
  const placeholderText = useTranslatedText('cheatsheet.search')
  const cheatsheetSearchIndexEntries = useMemo(
    () =>
      allCheatsheetExtensions.flatMap((entry) => {
        if (hasCheatsheetTopics(entry)) {
          return entry.topics.map((innerEntry) => buildSearchIndexEntry(innerEntry, entry.i18nKey))
        }
        return buildSearchIndexEntry(entry)
      }),
    [buildSearchIndexEntry, allCheatsheetExtensions]
  )
  const searchResults = useDocumentSearch(cheatsheetSearchIndexEntries, searchOptions, searchTerm)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setVisibleExtensions(allCheatsheetExtensions)
      return
    }
    const mappedResults = searchResults.flatMap((result) => result.result)
    const extensionResults = allCheatsheetExtensions.filter((extension) => {
      return mappedResults.includes(extension.i18nKey)
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
