/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'

/**
 * Hook to check if a specific note is pinned.
 *
 * @param noteAlias The primary alias of the note to check
 * @returns true if the note is pinned, false otherwise
 */
export const useIsNotePinned = (noteAlias: string | undefined): boolean => {
  const pinnedNotes = useApplicationState((state) => state.pinnedNotes)

  return useMemo(() => {
    if (!noteAlias) {
      return false
    }
    return pinnedNotes[noteAlias] !== undefined
  }, [noteAlias, pinnedNotes])
}
