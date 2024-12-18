/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBaseUrl } from './use-base-url'
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'
import { LinkType } from '../../components/editor-page/sidebar/specific-sidebar-entries/share-note-sidebar-entry/share-modal/note-url-field'

/**
 * Provides the URLs to the current note in different view modes.
 */
export const useNoteLinks = () => {
  const baseUrl = useBaseUrl()
  const primaryAlias = useApplicationState((state) => state.noteDetails.primaryAlias)

  return useMemo(() => {
    const editor = primaryAlias ? new URL(`n/${primaryAlias}`, baseUrl).toString() : ''
    const presentation = primaryAlias ? new URL(`p/${primaryAlias}`, baseUrl).toString() : ''
    const readOnly = primaryAlias ? new URL(`s/${primaryAlias}`, baseUrl).toString() : ''
    return {
      [LinkType.EDITOR]: editor,
      [LinkType.SLIDESHOW]: presentation,
      [LinkType.DOCUMENT]: readOnly
    } as const
  }, [baseUrl, primaryAlias])
}
