/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { bufferToBase64Url, checkPassword, hashPassword } from './password';

const testPassword = 'thisIsATestPassword';

describe('hashPassword', () => {
  it('output looks like a bcrypt hash with 2^12 rounds of hashing', async () => {
    /*
     * a bcrypt hash example with the different parts highlighted:
     * $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
     * \__/\/ \____________________/\_____________________________/
     * Alg Cost      Salt                        Hash
     * from https://en.wikipedia.org/wiki/Bcrypt#Description
     */
    const regexBcrypt = /^\$2[abxy]\$12\$[A-Za-z0-9/.]{53}$/;
    const hash = await hashPassword(testPassword);
    expect(regexBcrypt.test(hash)).toBeTruthy();
  });
  it('calls bcrypt.hash with the correct parameters', async () => {
    const spy = jest.spyOn(bcrypt, 'hash');
    await hashPassword(testPassword);
    expect(spy).toHaveBeenCalledWith(testPassword, 12);
  });
});

describe('checkPassword', () => {
  it("is returning true if the inputs are a plaintext password and it's bcrypt-hashed version", async () => {
    const hashOfTestPassword =
      '$2a$12$WHKCq4c0rg19zyx5WgX0p.or0rjSKYpIBcHhQQGLrxrr6FfMPylIW';
    await checkPassword(testPassword, hashOfTestPassword).then((result) =>
      expect(result).toBeTruthy(),
    );
  });
  it('fails, if secret is too short', async () => {
    const secret = bufferToBase64Url(randomBytes(54));
    const hash = await hashPassword(secret);
    await checkPassword(secret, hash).then((result) =>
      expect(result).toBeTruthy(),
    );
    await checkPassword(secret.substr(0, secret.length - 1), hash).then(
      (result) => expect(result).toBeFalsy(),
    );
  });
});

describe('bufferToBase64Url', () => {
  it('transforms a buffer to the correct base64url encoded string', () => {
    expect(
      bufferToBase64Url(Buffer.from('testsentence is a test sentence')),
    ).toEqual('dGVzdHNlbnRlbmNlIGlzIGEgdGVzdCBzZW50ZW5jZQ');
  });
});
