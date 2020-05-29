import React, { Fragment, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { setUp } from '../../initializers'
import './application-loader.scss'
import { LoadingScreen } from './loading-screen'

export const ApplicationLoader: React.FC = ({ children }) => {
  const [failed, setFailed] = useState<boolean>(false)
  const [doneTasks, setDoneTasks] = useState<number>(0)
  const [initTasks, setInitTasks] = useState<Promise<void>[]>([])
  const { pathname } = useLocation()

  const runTask = async (task: Promise<void>): Promise<void> => {
    await task
    setDoneTasks(prevDoneTasks => {
      return prevDoneTasks + 1
    })
  }

  useEffect(() => {
    const baseUrl:string = window.location.pathname.replace(pathname, '') + '/'
    console.debug('Base URL is', baseUrl)
    setInitTasks(setUp(baseUrl))
  }, [pathname])

  useEffect(() => {
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
