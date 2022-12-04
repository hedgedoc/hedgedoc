/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ActiveIndicatorStatus } from '../../../../redux/realtime/types'
import styles from './active-indicator.module.scss'
import React from 'react'

export interface ActiveIndicatorProps {
  status: ActiveIndicatorStatus
}

/**
 * Renders an indicator corresponding to the given status.
 *
 * @param status The state of the indicator to render
 */
export const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ status }) => {
  return <span className={`${styles['activeIndicator']} ${status}`} />
}
