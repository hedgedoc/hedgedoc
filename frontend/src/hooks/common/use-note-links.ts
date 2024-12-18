/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBaseUrl } from './use-base-url'
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'
import { NotePageType } from './use-get-note-page-type'

/**
 * Provides the URLs to the current note in different view modes.
 */
export const useNoteLinks = () => {
  const baseUrl = useBaseUrl()
  const noteAddress = useApplicationState((state) => state.noteDetails.primaryAddress)

  return useMemo(() => {
    const editor = noteAddress ? new URL(`n/${noteAddress}`, baseUrl).toString() : ''
    const presentation = noteAddress ? new URL(`p/${noteAddress}`, baseUrl).toString() : ''
    const readOnly = noteAddress ? new URL(`s/${noteAddress}`, baseUrl).toString() : ''
    return {
      [NotePageType.EDITOR]: editor,
      [NotePageType.PRESENTATION]: presentation,
      [NotePageType.READ_ONLY]: readOnly
    } as const
  }, [baseUrl, noteAddress])
}
