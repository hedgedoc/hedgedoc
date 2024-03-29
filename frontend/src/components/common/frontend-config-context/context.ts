/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfig } from '../../../api/config/types'
import { createContext } from 'react'

export const frontendConfigContext = createContext<FrontendConfig | undefined>(undefined)
