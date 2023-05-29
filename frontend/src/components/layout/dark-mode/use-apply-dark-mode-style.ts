/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from '../../../hooks/dark-mode/use-dark-mode-state'
import { useEffect } from 'react'

/**
 * Applies the dark mode by adding a css class to the body tag.
 */
export const useApplyDarkModeStyle = (): void => {
  const darkMode = useDarkModeState()
  useEffect(() => {
    if (darkMode) {
      window.document.body.dataset.bsTheme = 'dark'
    } else {
      window.document.body.dataset.bsTheme = 'light'
    }
  }, [darkMode])

  useEffect(
    () => () => {
      window.document.body.dataset.bsTheme = 'light'
    },
    []
  )
}
