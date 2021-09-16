/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { compare, hash } from 'bcrypt';

export async function hashPassword(cleartext: string): Promise<string> {
  // hash the password with bcrypt and 2^12 iterations
  // this was decided on the basis of https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt
  return await hash(cleartext, 12);
}

export async function checkPassword(
  cleartext: string,
  password: string,
): Promise<boolean> {
  return await compare(cleartext, password);
}

export function bufferToBase64Url(text: Buffer): string {
  // This is necessary as the is no base64url encoding in the toString method
  // but as can be seen on https://tools.ietf.org/html/rfc4648#page-7
  // base64url is quite easy buildable from base64
  return text
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
