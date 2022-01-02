/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next'
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'

/**
 * Returns the title of the note or a placeholder text.
 */
export const useNoteTitle = (): string => {
  const { t } = useTranslation()
  const untitledNote = useMemo(() => t('editor.untitledNote'), [t])
  const noteTitle = useApplicationState((state) => state.noteDetails.noteTitle)

  return useMemo(() => (noteTitle === '' ? untitledNote : noteTitle), [noteTitle, untitledNote])
}
