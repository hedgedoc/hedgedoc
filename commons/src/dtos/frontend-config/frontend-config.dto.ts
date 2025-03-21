/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { GuestAccess } from '../permissions/index.js'
import { ServerVersionSchema } from '../monitoring/index.js'
import { BrandingSchema } from './branding.dto.js'
import { SpecialUrlSchema } from './special-urls.dto.js'
import { AuthProviderSchema } from './auth-provider.dto.js'

export const FrontendConfigSchema = z
  .object({
    guestAccess: z
      .nativeEnum(GuestAccess)
      .describe('Maximum access level for guest users'),
    allowRegister: z
      .boolean()
      .describe('Are users allowed to register on this instance?'),
    allowProfileEdits: z
      .boolean()
      .describe('Are users allowed to edit their profile information?'),
    allowChooseUsername: z
      .boolean()
      .describe(
        'Are users allowed to choose their username when signing up via OIDC?',
      ),
    authProviders: z
      .array(AuthProviderSchema)
      .describe(
        'Which auth providers are enabled and how are they configured?',
      ),
    branding: BrandingSchema.describe('Individual branding information'),
    useImageProxy: z.boolean().describe('Is an image proxy enabled?'),
    specialUrls: SpecialUrlSchema.describe('Links to some special pages'),
    version: ServerVersionSchema.describe('The version of HedgeDoc'),
    plantUmlServer: z
      .string()
      .url()
      .nullable()
      .describe('The PlantUML server that should be used to render.'),
    maxDocumentLength: z
      .number()
      .positive()
      .describe('The maximal length of each document'),
  })
  .describe(
    'Config properties that are received by the frontend to adjust its own behaviour',
  )

export type FrontendConfigDto = z.infer<typeof FrontendConfigSchema>
