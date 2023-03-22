/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './active-indicator.module.scss'
import React from 'react'

export interface ActiveIndicatorProps {
  active: boolean
}

/**
 * Renders an indicator corresponding to the given status.
 *
 * @param status The state of the indicator to render
 */
export const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ active }) => {
  return <span className={`${styles['activeIndicator']} ${active ? styles.active : styles.inactive}`} />
}
