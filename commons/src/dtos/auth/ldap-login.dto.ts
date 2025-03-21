/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const LdapLoginSchema = z
  .object({
    username: z.string().describe('The username to log in at the LDAP server'),
    password: z.string().describe('The password to log in at the LDAP server'),
  })
  .describe('DTO to login via a LDAP server.')

export type LdapLoginDto = z.infer<typeof LdapLoginSchema>
