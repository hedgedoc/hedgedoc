/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import styles from './toolbar-separator.module.scss'

/**
 * Separates logical groups of editor toolbar actions.
 */
export const ToolbarSeparator: React.FC = () => {
  return <span role={'separator'} aria-orientation={'vertical'} className={styles.separator} />
}
