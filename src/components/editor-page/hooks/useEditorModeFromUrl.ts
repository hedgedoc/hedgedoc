/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { EditorMode } from '../app-bar/editor-view-mode'
import { setEditorMode } from '../../../redux/editor/methods'
import { useLocation } from 'react-router'

export const useEditorModeFromUrl = (): void => {
  const { search } = useLocation()

  useEffect(() => {
    const requestedMode = search.substr(1)
    const mode = Object.values(EditorMode).find((mode) => mode === requestedMode)
    if (mode) {
      setEditorMode(mode)
    }
  }, [search])
}
