/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactNode } from 'react'
import React from 'react'
import styles from './editor-bar.module.scss'

export interface EditorBarProps {
  left?: ReactNode
  middle?: ReactNode
  right?: ReactNode
}

/**
 * Renders a persistent editor bar with independently positioned content.
 *
 * @param left Content aligned to the left.
 * @param middle Content centered in the bar.
 * @param right Content aligned to the right.
 */
export const EditorBar: React.FC<EditorBarProps> = ({ left, middle, right }) => {
  return (
    <div className={styles['editor-bar']}>
      <div className={styles['left']}>{left}</div>
      <div className={styles['middle']}>{middle}</div>
      <div className={styles['right']}>{right}</div>
    </div>
  )
}
