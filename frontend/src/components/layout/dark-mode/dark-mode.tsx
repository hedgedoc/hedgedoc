'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplyDarkModeStyle } from './use-apply-dark-mode-style'
import type React from 'react'

export const DarkMode: React.FC = () => {
  useApplyDarkModeStyle()

  return null
}
