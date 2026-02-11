/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const BackchannelLogoutSchema = z
  .object({
    logout_token: z.string().describe('The JWT logout token from the OIDC provider'),
  })
  .describe('Request body for OIDC backchannel logout endpoint')

export type BackchannelLogoutInterface = z.infer<typeof BackchannelLogoutSchema>
