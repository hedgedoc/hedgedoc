/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAppTitle } from '../../hooks/common/use-app-title'
import { useNoteTitle } from '../../hooks/common/use-note-title'
import Head from 'next/head'
import React, { useMemo } from 'react'

/**
 * Sets the note and app title for the browser window
 */
export const NoteAndAppTitleHead: React.FC = () => {
  const noteTitle = useNoteTitle()
  const appTitle = useAppTitle()

  const noteAndAppTitle = useMemo(() => {
    return noteTitle + ' - ' + appTitle
  }, [appTitle, noteTitle])

  return (
    <Head>
      <title>{noteAndAppTitle}</title>
    </Head>
  )
}
