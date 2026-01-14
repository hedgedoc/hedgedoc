/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '../../constants/index.js'

export const PendingUserConfirmationSchema = z
  .object({
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH)
      .max(MAX_USERNAME_LENGTH)
      .toLowerCase()
      .describe('The chosen new username for the pending user'),
    displayName: z.string().describe('The new display name for the pending user'),
    profilePicture: z
      .string()
      .url()
      .nullable()
      .describe('The URL to the chosen profile picture or null to use the auto-generated one'),
  })
  .describe(
    'DTO for the confirmation of a new user account. When a new user is created through OIDC login, they get asked to choose some details for their new account.',
  )

export type PendingUserConfirmationInterface = z.infer<typeof PendingUserConfirmationSchema>
