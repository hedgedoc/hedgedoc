/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import type { IconName } from '../../common/fork-awesome/types'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import styles from './animations.module.scss'

const elements: IconName[] = [
  'file-text',
  'markdown',
  'pencil',
  'bold',
  'italic',
  'align-justify',
  'tag',
  'user',
  'file',
  'keyboard-o',
  'cog',
  'font'
]

/**
 * Chooses a random fork awesome icon from a predefined set and renders it.
 */
export const RandomIcon: React.FC = () => {
  const icon = useMemo(() => elements[Math.floor(Math.random() * elements.length)], [])

  return <ForkAwesomeIcon icon={icon} className={styles.particle}></ForkAwesomeIcon>
}
