/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { refreshHistoryState } from '../../../redux/history/methods'
import { Logger } from '../../../utils/logger'
import { isDevMode, isTestMode } from '../../../utils/test-modes'
import { loadDarkMode } from './load-dark-mode'
import { setUpI18n } from './setupI18n'
import { loadFromLocalStorage } from '../../../redux/editor-config/methods'
import { fetchAndSetUser } from '../../login-page/utils/fetch-and-set-user'

const logger = new Logger('Application Loader')

/**
 * Create a custom delay in the loading of the application.
 */
const customDelay: () => Promise<void> = async () => {
  if ((isDevMode || isTestMode) && (window.location.search.startsWith('?customDelay=') || isCustomDelayActive())) {
    return new Promise((resolve) => setTimeout(resolve, 500000000))
  } else {
    return Promise.resolve()
  }
}

const isCustomDelayActive = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage.getItem('customDelay') !== null
    )
  } catch {
    return false
  }
}

export interface InitTask {
  name: string
  task: () => Promise<void>
}

const fetchUserInformation = async (): Promise<void> => {
  try {
    await fetchAndSetUser()
  } catch {
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
