import React, { Fragment, useEffect, useState } from 'react'
import './application-loader.scss'
import { LoadingScreen } from './loading-screen'

interface ApplicationLoaderProps {
  initTasks: Promise<void>[]
}

export const ApplicationLoader: React.FC<ApplicationLoaderProps> = ({ children, initTasks }) => {
  const [failed, setFailed] = useState<boolean>(false)
  const [doneTasks, setDoneTasks] = useState<number>(0)

  const runTask:((task: Promise<void>) => (Promise<void>)) = async (task) => {
    await task
    setDoneTasks(prevDoneTasks => {
      return prevDoneTasks + 1
    })
  }

  useEffect(() => {
    setDoneTasks(0)
    for (const task of initTasks) {
      runTask(task).catch(reason => {
        setFailed(true)
        console.error(reason)
      })
    }
  }, [initTasks])

  return (
    doneTasks < initTasks.length || initTasks.length === 0
      ? <LoadingScreen failed={failed}/>
      : <Fragment>{children}</Fragment>
  )
}
