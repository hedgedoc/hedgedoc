/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useBackendBaseUrl } from '../../hooks/common/use-backend-base-url'
import './application-loader.scss'
import { createSetUpTaskList, InitTask } from './initializers'
import { LoadingScreen } from './loading-screen'
import { useCustomizeAssetsUrl } from '../../hooks/common/use-customize-assets-url'
import { useFrontendAssetsUrl } from '../../hooks/common/use-frontend-assets-url'

export const ApplicationLoader: React.FC = ({ children }) => {
  const frontendAssetsUrl = useFrontendAssetsUrl()
  const backendBaseUrl = useBackendBaseUrl()
  const customizeAssetsUrl = useCustomizeAssetsUrl()

  const setUpTasks = useCallback(
    () => createSetUpTaskList(frontendAssetsUrl, customizeAssetsUrl, backendBaseUrl),
    [backendBaseUrl, customizeAssetsUrl, frontendAssetsUrl]
  )

  const [failedTitle, setFailedTitle] = useState<string>('')
  const [doneTasks, setDoneTasks] = useState<number>(0)
  const [initTasks] = useState<InitTask[]>(setUpTasks)

  const runTask = useCallback(async (task: Promise<void>): Promise<void> => {
    await task
    setDoneTasks((prevDoneTasks) => {
      return prevDoneTasks + 1
    })
  }, [])

  useEffect(() => {
    for (const task of initTasks) {
      runTask(task.task).catch((reason: Error) => {
        console.error(reason)
        setFailedTitle(task.name)
      })
    }
  }, [initTasks, runTask])

  const tasksAreRunning = doneTasks < initTasks.length || initTasks.length === 0

  if (tasksAreRunning) {
    return <LoadingScreen failedTitle={failedTitle} />
  } else {
    return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
  }
}
