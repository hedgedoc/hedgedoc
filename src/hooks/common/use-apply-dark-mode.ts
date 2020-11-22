/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'

export const useApplyDarkMode = ():void => {
  const darkModeActivated = useSelector((state: ApplicationState) => state.darkMode.darkMode)

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
