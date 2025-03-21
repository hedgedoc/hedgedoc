/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const BrandingSchema = z
  .object({
    name: z
      .string()
      .nullable()
      .describe('The name to be displayed next to the HedgeDoc logo'),
    logo: z
      .string()
      .url()
      .nullable()
      .describe('URL to the logo to be displayed next to the HedgeDoc logo'),
  })
  .describe('The configuration for branding of the HedgeDoc instance.')

export type BrandingDto = z.infer<typeof BrandingSchema>
