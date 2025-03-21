/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const LdapLoginResponseSchema = z
  .object({
    newUser: z.boolean().describe('If the LDAP user was newly created.'),
  })
  .describe('DTO to login via a LDAP server.')

export type LdapLoginResponseDto = z.infer<typeof LdapLoginResponseSchema>
