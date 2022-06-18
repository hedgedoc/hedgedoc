/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setUpI18n } from './setupI18n'
import { refreshHistoryState } from '../../../redux/history/methods'
import { fetchMotd } from './fetch-motd'
import { fetchAndSetUser } from '../../login-page/auth/utils'
import { fetchFrontendConfig } from './fetch-frontend-config'
import { loadDarkMode } from './load-dark-mode'
import { isDevMode, isTestMode } from '../../../utils/test-modes'

const customDelay: () => Promise<void> = async () => {
  if (
    (isDevMode || isTestMode) &&
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined' &&
    (window.location.search.startsWith('?customDelay=') || window.localStorage.getItem('customDelay'))
  ) {
    return new Promise((resolve) => setTimeout(resolve, 500000000))
  } else {
    return Promise.resolve()
  }
}

export interface InitTask {
  name: string
  task: () => Promise<void>
}

export const createSetUpTaskList = (): InitTask[] => {
  return [
    {
      name: 'Load dark mode',
      task: loadDarkMode
    },
    {
      name: 'Load Translations',
      task: setUpI18n
    },
    {
      name: 'Load config',
      task: fetchFrontendConfig
    },
    {
      name: 'Fetch user information',
      task: fetchAndSetUser
    },
    {
      name: 'Motd',
      task: fetchMotd
    },
    {
      name: 'Load history state',
      task: refreshHistoryState
    },
    {
      name: 'Add Delay',
      task: customDelay
    }
  ]
}
