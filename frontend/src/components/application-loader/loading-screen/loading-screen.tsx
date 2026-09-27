/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from '../application-loader.module.scss'
import { LoadingAnimation } from './loading-animation'
import type { ReactElement } from 'react'
import React from 'react'
import { Alert } from 'react-bootstrap'
import { darkModeStateSync } from '../../../hooks/dark-mode/use-dark-mode-state'

export interface LoadingScreenProps {
  errorMessage?: string | ReactElement | null
}

/**
 * Renders a loading animation.
 *
 * @param failedTaskName Should be set if a task failed to load. The name will be shown on screen.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ errorMessage }) => {
  let darkMode = darkModeStateSync()
  console.log(darkMode)

  return (
    <div className={`${styles.loader} ${darkMode ? 'text-light' : 'text-dark'} ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className='mb-3'>
        <span className={`d-block`}>
          <LoadingAnimation error={!!errorMessage} />
        </span>
      </div>
      {errorMessage && <Alert variant={'danger'}>{errorMessage}</Alert>}
    </div>
  )
}
