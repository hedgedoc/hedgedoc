/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { useTranslatedText } from './use-translated-text'
import { useMemo } from 'react'

/**
 * Retrieves the title of the note or a placeholder text, if no title is set.
 *
 * @return The title of the note
 */
export const useNoteTitle = (): string => {
  const untitledNote = useTranslatedText('editor.untitledNote')
  const noteTitle = useApplicationState((state) => state.noteDetails?.title)

  return useMemo(() => (!noteTitle ? untitledNote : noteTitle), [noteTitle, untitledNote])
}
