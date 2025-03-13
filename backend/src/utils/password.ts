/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { hash, verify } from '@node-rs/argon2';
import { createHash, timingSafeEqual } from 'crypto';

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

/**
 * Transform a {@link Buffer} into a base64Url encoded string
 *
 * This is necessary as the is no base64url encoding in the toString method
 * but as can be seen on https://tools.ietf.org/html/rfc4648#page-7
 * base64url is quite easy buildable from base64
 *
 * @param text The buffer we want to decode
 * @returns The base64Url encoded string
 */
export function bufferToBase64Url(text: Buffer): string {
  return text
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Hash an api token.
 *
 * @param token the token to be hashed
 * @returns the hashed token
 */
export function hashApiToken(token: string): string {
  return createHash('sha512').update(token).digest('hex');
}

/**
 * Check if the given token is the same as what we have in the database.
 *
 * Normally, both hashes have the same length, as they are both SHA512
 * This is only defense-in-depth, as timingSafeEqual throws if the buffers are not of the same length
 *
 * @param givenToken The token the user gave us.
 * @param databaseToken The token we have saved in the database.
 * @returns Wether or not the tokens are the equal
 */
export function checkTokenEquality(
  givenToken: string,
  databaseToken: string,
): boolean {
  const givenHash = Buffer.from(hashApiToken(givenToken));
  const databaseHash = Buffer.from(databaseToken);
  return (
    databaseHash.length === givenHash.length &&
    timingSafeEqual(givenHash, databaseHash)
  );
}
