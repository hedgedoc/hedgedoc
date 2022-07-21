/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { useIsDarkModeActivated } from './use-is-dark-mode-activated'

/**
 * Applies the `dark` css class to the body tag according to the dark mode state.
 */
export const useApplyDarkMode = (): void => {
  const darkModeActivated = useIsDarkModeActivated()

  useEffect(() => {
    if (darkModeActivated) {
      window.document.body.classList.add('dark')
    } else {
      window.document.body.classList.remove('dark')
    }
    return () => {
      window.document.body.classList.remove('dark')
    }
  }, [darkModeActivated])
}
