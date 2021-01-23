/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { useIsDarkModeActivated } from './use-is-dark-mode-activated'

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
