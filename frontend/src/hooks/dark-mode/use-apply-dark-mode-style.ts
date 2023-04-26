/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from './use-dark-mode-state'
import { useEffect } from 'react'

/**
 * Applies the dark mode by adding a css class to the body tag.
 */
export const useApplyDarkModeStyle = (): void => {
  const darkMode = useDarkModeState()
  useEffect(() => {
    if (darkMode) {
      window.document.body.classList.add('dark')
    } else {
      window.document.body.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => () => window.document.body.classList.remove('dark'), [])
}
