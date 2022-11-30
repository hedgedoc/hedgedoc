/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { createNumberRangeArray } from '../../common/number-range/number-range'
import styles from './animations.module.scss'
import { IconRow } from './icon-row'
import React, { useMemo } from 'react'

export interface HedgeDocLogoProps {
  error: boolean
}

/**
 * Shows a loading animation.
 *
 * @param error Defines if the error animation should be shown instead
 */
export const LoadingAnimation: React.FC<HedgeDocLogoProps> = ({ error }) => {
  const iconRows = useMemo(() => createNumberRangeArray(12).map((index) => <IconRow key={index} />), [])

  return (
    <div className={`position-relative ${error ? styles.error : ''}`}>
      <div className={styles.logo}>
        <div>
          <ForkAwesomeIcon icon={'pencil'} className={styles.background} size={'5x'}></ForkAwesomeIcon>
        </div>
        <div className={`${styles.overlay}`}>
          <ForkAwesomeIcon icon={'pencil'} size={'5x'}></ForkAwesomeIcon>
        </div>
      </div>
      <div className={styles.pulse}></div>
      <div className={styles.rows}>{iconRows}</div>
    </div>
  )
}
