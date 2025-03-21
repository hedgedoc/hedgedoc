/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const PendingUserConfirmationSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(64)
      .toLowerCase()
      .describe('The chosen new username for the pending user'),
    displayName: z
      .string()
      .describe('The new display name for the pending user'),
    profilePicture: z
      .string()
      .url()
      .nullable()
      .describe(
        'The URL to the chosen profile picture or null to use the auto-generated one',
      ),
  })
  .describe(
    'DTO for the confirmation of a new user account. When a new user is created through OIDC login, they get asked to choose some details for their new account.',
  )

export type PendingUserConfirmationDto = z.infer<
  typeof PendingUserConfirmationSchema
>
