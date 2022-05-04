/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Alert } from 'react-bootstrap'
import { LoadingAnimation } from './loading-animation'
import { ShowIf } from '../../common/show-if/show-if'
import styles from '../application-loader.module.scss'

export interface LoadingScreenProps {
  failedTaskName?: string
}

/**
 * Renders a loading animation.
 *
 * @param failedTaskName Should be set if a task failed to load. The name will be shown on screen.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ failedTaskName }) => {
  return (
    <div className={`${styles.loader} ${styles.middle} text-light overflow-hidden`}>
      <div className='mb-3 text-light'>
        <span className={`d-block`}>
          <LoadingAnimation error={!!failedTaskName} />
        </span>
      </div>
      <ShowIf condition={!!failedTaskName}>
        <Alert variant={'danger'}>
          The task {failedTaskName} failed.
          <br />
          For further information look into the browser console.
        </Alert>
      </ShowIf>
    </div>
  )
}
