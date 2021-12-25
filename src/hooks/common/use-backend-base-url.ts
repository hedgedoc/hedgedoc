/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isMockMode } from '../../utils/test-modes'
import { useMemo } from 'react'

export const useBackendBaseUrl = (): string => {
  return useMemo(() => {
    const mockMode = isMockMode()
    if (!mockMode && process.env.NEXT_PUBLIC_BACKEND_BASE_URL === undefined) {
      throw new Error('NEXT_PUBLIC_BACKEND_BASE_URL is unset and mock mode is disabled')
    }

    return mockMode ? '/mock-backend/' : (process.env.NEXT_PUBLIC_BACKEND_BASE_URL as string)
  }, [])
}
