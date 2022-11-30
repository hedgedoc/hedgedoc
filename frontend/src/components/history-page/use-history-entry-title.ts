/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../../api/history/types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Hook that returns the title of a note in the history if present or the translation for "untitled" otherwise.
 *
 * @param entry The history entry containing a title property, that might be an empty string.
 * @return A memoized string containing either the title of the entry or the translated version of "untitled".
 */
export const useHistoryEntryTitle = (entry: HistoryEntryWithOrigin): string => {
  const { t } = useTranslation()
  return useMemo(() => {
    return entry.title !== '' ? entry.title : t('editor.untitledNote')
  }, [t, entry])
}
