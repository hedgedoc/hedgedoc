/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const SpecialUrlSchema = z
  .object({
    privacy: z
      .string()
      .url()
      .nullable()
      .describe('A link to the privacy notice'),
    termsOfUse: z
      .string()
      .url()
      .nullable()
      .describe('A link to the privacy notice'),
    imprint: z
      .string()
      .url()
      .nullable()
      .describe('A link to the imprint notice'),
  })
  .describe('The special urls an HedgeDoc instance can link to.')

export type SpecialUrlDto = z.infer<typeof SpecialUrlSchema>
