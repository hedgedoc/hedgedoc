/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

// Note that this schema needs to match the OIDC backchannel logout spec
// https://openid.net/specs/openid-connect-backchannel-1_0.html#BCRequest

export const BackchannelLogoutSchema = z
  .object({
    logout_token: z.string().describe('The JWT logout token from the OIDC provider'),
  })
  .describe('Request body for OIDC back-channel logout endpoint')

export type BackchannelLogoutInterface = z.infer<typeof BackchannelLogoutSchema>
