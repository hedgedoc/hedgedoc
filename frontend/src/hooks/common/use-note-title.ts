/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Retrieves the title of the note or a placeholder text, if no title is set.
 *
 * @return The title of the note
 */
export const useNoteTitle = (): string => {
  const { t } = useTranslation()
  const untitledNote = useMemo(() => t('editor.untitledNote'), [t])
  const noteTitle = useApplicationState((state) => state.noteDetails.title)

  return useMemo(() => (noteTitle === '' ? untitledNote : noteTitle), [noteTitle, untitledNote])
}
