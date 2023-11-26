/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './realtime-colors.module.scss'

export const createRealtimeColorCssClass = (styleIndex: number): string => {
  return styles[`color-${Math.max(Math.min(styleIndex, 7), 0)}`]
}
