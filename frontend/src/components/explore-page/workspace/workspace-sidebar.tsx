'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { UiIcon } from '../../../common/icons/ui-icon'
import { Plus, Folder, Tag } from 'react-bootstrap-icons'
import styles from './workspace.module.scss'

interface WorkspaceSidebarProps {
  onCreateNote: () => void
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ onCreateNote }) => {
  return (
    <div className={styles.sidebar}>
      <button className={styles.createButton} onClick={onCreateNote}>
        <UiIcon icon={Plus} /> Create my note
      </button>

      <div className={styles.sectionHeader}>
        <UiIcon icon={Folder} /> My Notes
      </div>
      <div className={styles.navItem}>
        <span>Nullitator</span>
        <span className={styles.count}>3</span>
      </div>
      <div className={styles.navItem}>
        <span>Lendasat</span>
        <span className={styles.count}>1</span>
      </div>
      <div className={styles.navItem}>
        <span>TF1</span>
        <span className={styles.count}>8</span>
      </div>

      <div className={styles.sectionHeader}>
        <UiIcon icon={Tag} /> Tags
      </div>
      <div className={styles.navItem}>
        <span>Untagged</span>
        <span className={styles.count}>48</span>
      </div>
      <div className={styles.navItem}>
        <span>llm</span>
        <span className={styles.count}>1</span>
      </div>
      <div className={styles.navItem}>
        <span>performance</span>
        <span className={styles.count}>2</span>
      </div>
    </div>
  )
}
