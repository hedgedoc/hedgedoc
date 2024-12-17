/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsString } from 'class-validator';

export class LdapLoginDto {
  @IsString()
  username: string; // This is not of type Username, because LDAP server may use mixed case usernames
  @IsString()
  password: string;
}
