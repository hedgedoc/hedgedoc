import React, { Fragment, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { setUp, InitTask } from '../../initializers'
import './application-loader.scss'

import { LoadingScreen } from './loading-screen'

export const ApplicationLoader: React.FC = ({ children }) => {
  const [failedTitle, setFailedTitle] = useState<string>('')
  const [doneTasks, setDoneTasks] = useState<number>(0)
  const [initTasks, setInitTasks] = useState<InitTask[]>([])
  const { pathname } = useLocation()
  const [applicationLoading, setApplicationLoading] = useState<boolean>(false)

  const runTask = async (task: Promise<void>): Promise<void> => {
    await task
    setDoneTasks(prevDoneTasks => {
      return prevDoneTasks + 1
    })
  }

  useEffect(() => {
    if (applicationLoading) {
      return
    }
    setApplicationLoading(true)
    const baseUrl:string = window.location.pathname.replace(pathname, '') + '/'
    console.debug('Base URL is', baseUrl)
    setInitTasks(setUp(baseUrl))
  }, [applicationLoading, pathname])

  useEffect(() => {
    for (const task of initTasks) {
      runTask(task.task).catch((reason: Error) => {
        console.error(reason)
        setFailedTitle(task.name)
      })
    }
  }, [initTasks])

  return (
    doneTasks < initTasks.length || initTasks.length === 0
      ? <LoadingScreen failedTitle={failedTitle}/>
      : <Fragment>{children}</Fragment>
  )
}
