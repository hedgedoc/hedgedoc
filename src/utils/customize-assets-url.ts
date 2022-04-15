/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { backendUrl } from './backend-url'
import { isMockMode } from './test-modes'

export const customizeAssetsUrl = isMockMode
  ? `/mock-public/`
  : process.env.NEXT_PUBLIC_CUSTOMIZE_ASSETS_URL || `${backendUrl}public/`
