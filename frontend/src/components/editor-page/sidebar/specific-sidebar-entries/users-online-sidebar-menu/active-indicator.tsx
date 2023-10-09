/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './active-indicator.module.scss'
import React from 'react'
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'

export interface ActiveIndicatorProps {
  active: boolean
}

/**
 * Renders an indicator corresponding to the given status.
 *
 * @param status The state of the indicator to render
 */
export const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ active }) => {
  const textActive = useTranslatedText('editor.onlineStatus.active')
  const textInactive = useTranslatedText('editor.onlineStatus.inactive')

  return (
    <span
      title={active ? textActive : textInactive}
      className={`${styles['activeIndicator']} ${active ? styles.active : styles.inactive}`}
    />
  )
}
