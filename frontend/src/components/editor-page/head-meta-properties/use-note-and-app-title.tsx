/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAppTitle } from '../../../hooks/common/use-app-title'
import { useNoteTitle } from '../../../hooks/common/use-note-title'
import { useHasMarkdownContentBeenChangedInBackground } from './hooks/use-has-markdown-content-been-changed-in-background'
import { useEffect, useMemo } from 'react'

/**
 * Sets the note and app title for the browser window
 */
export const useNoteAndAppTitle = (): void => {
  const noteTitle = useNoteTitle()
  const appTitle = useAppTitle()
  const showDot = useHasMarkdownContentBeenChangedInBackground()

  const noteAndAppTitle = useMemo(() => {
    return (showDot ? '• ' : '') + noteTitle + ' - ' + appTitle
  }, [appTitle, noteTitle, showDot])

  useEffect(() => {
    document.title = noteAndAppTitle
  }, [noteAndAppTitle])
}
