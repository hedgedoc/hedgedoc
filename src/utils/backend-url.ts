/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isMockMode } from './test-modes'

if (!isMockMode && process.env.NEXT_PUBLIC_BACKEND_BASE_URL === undefined) {
  throw new Error('NEXT_PUBLIC_BACKEND_BASE_URL is unset and mock mode is disabled')
}

export const backendUrl = isMockMode ? '/' : (process.env.NEXT_PUBLIC_BACKEND_BASE_URL as string)
