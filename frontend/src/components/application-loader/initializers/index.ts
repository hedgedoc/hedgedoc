/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { refreshHistoryState } from '../../../redux/history/methods'
import { Logger } from '@hedgedoc/commons'
import { isDevMode, isTestMode } from '@hedgedoc/commons'
import { fetchAndSetUser } from '../../login-page/auth/utils'
import { loadDarkMode } from './load-dark-mode'
import { setUpI18n } from './setupI18n'
import { loadFromLocalStorage } from '../../../redux/editor/methods'

const logger = new Logger('Application Loader')

/**
 * Create a custom delay in the loading of the application.
 */
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

const fetchUserInformation = async (): Promise<void> => {
  try {
    await fetchAndSetUser()
  } catch (error) {
    logger.error("Couldn't load user. Probably not logged in.")
  }
}

/**
 * Create a list of tasks, that need to be fulfilled on startup.
 */
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
      name: 'Fetch user information',
      task: fetchUserInformation
    },
    {
      name: 'Load history state',
      task: refreshHistoryState
    },
    {
      name: 'Load preferences',
      task: loadFromLocalStorageAsync
    },
    {
      name: 'Add Delay',
      task: customDelay
    }
  ]
}

const loadFromLocalStorageAsync = (): Promise<void> => {
  loadFromLocalStorage()
  return Promise.resolve()
}
