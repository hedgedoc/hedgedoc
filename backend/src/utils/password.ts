/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { hash, verify } from '@node-rs/argon2';

/**
 * Hashes a password using argon2id
 *
 * @param cleartext The password to hash
 * @returns The hashed password
 */
export async function hashPassword(cleartext: string): Promise<string> {
  // options recommended by OWASP
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
  return await hash(cleartext, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Checks if a cleartext password matches a password hash
 *
 * @param cleartext The cleartext password
 * @param passwordHash The password hash
 * @returns Whether the password matches the hash
 */
export async function checkPassword(
  cleartext: string,
  passwordHash: string,
): Promise<boolean> {
  return await verify(passwordHash, cleartext);
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
