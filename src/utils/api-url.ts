/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isMockMode } from './test-modes'
import { backendUrl } from './backend-url'

/**
 * Generates the url to the api.
 */
export const apiUrl = isMockMode ? `/api/mock-backend/private/` : `${backendUrl}api/private/`
