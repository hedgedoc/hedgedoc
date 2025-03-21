/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'
import { FullUserInfoSchema } from './full-user-info.dto.js'

export const FullUserInfoWithIdSchema = FullUserInfoSchema.merge(
  z.object({
    id: z.string().describe('The id from the LDAP server'),
  }),
).describe(
  'The full user information with id is only used during the LDAP login process',
)

export type FullUserInfoWithIdDto = z.infer<typeof FullUserInfoWithIdSchema>
