/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfigInterface } from '@hedgedoc/commons'
import { createContext } from 'react'

export const frontendConfigContext = createContext<FrontendConfigInterface | undefined>(undefined)
