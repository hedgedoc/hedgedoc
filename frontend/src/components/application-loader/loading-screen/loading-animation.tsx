/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import { UiIcon } from '../../common/icons/ui-icon'
import { createNumberRangeArray } from '../../common/number-range/number-range'
import styles from './animations.module.scss'
import { IconRow } from './icon-row'
import React, { useMemo } from 'react'
import { Pencil as IconPencil, PencilFill as IconPencilFill } from 'react-bootstrap-icons'

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
    <div className={concatCssClasses('position-relative', { [styles.error]: error })}>
      <div className={styles.logo}>
        <div>
          <UiIcon icon={IconPencilFill} className={styles.background} size={5} />
        </div>
        <div className={styles.overlay}>
          <UiIcon icon={IconPencil} size={5} />
        </div>
      </div>
      <div className={styles.pulse}></div>
      <div className={styles.rows}>{iconRows}</div>
    </div>
  )
}
