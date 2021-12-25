/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { EditorMode } from '../app-bar/editor-view-mode'
import { setEditorMode } from '../../../redux/editor/methods'
import { useRouter } from 'next/router'

export const useEditorModeFromUrl = (): void => {
  const { query } = useRouter()

  useEffect(() => {
    const mode = Object.values(EditorMode).find((mode) => query[mode] !== undefined)
    if (mode) {
      setEditorMode(mode)
    }
  }, [query])
}
