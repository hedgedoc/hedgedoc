/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './cursor-colors.module.scss'

export const createCursorCssClass = (styleIndex: number): string => {
  return styles[`cursor-${Math.max(Math.min(styleIndex, 7), 0)}`]
}
