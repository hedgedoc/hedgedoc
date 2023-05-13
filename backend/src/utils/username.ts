/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Username = Lowercase<string>;

export function makeUsernameLowercase(username: string): Username {
  return username.toLowerCase() as Username;
}
