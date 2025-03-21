/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import { ApiTokenSchema } from './api-token.dto.js'

export const ApiTokenWithSecretSchema = ApiTokenSchema.merge(
  z.object({
    secret: z.string().describe('The secret part of the API token'),
  }),
).describe(
  'This is returned once after an api token is created to let the user know what their token is.',
)

export type ApiTokenWithSecretDto = z.infer<typeof ApiTokenWithSecretSchema>
