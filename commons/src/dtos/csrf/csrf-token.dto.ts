/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const CsrfTokenSchema = z.object({
  token: z.string().describe('The CSRF token to use for state-changing requests'),
})

export type CsrfTokenInterface = z.infer<typeof CsrfTokenSchema>
