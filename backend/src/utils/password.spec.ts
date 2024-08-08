/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import argon2 from '@node-rs/argon2';

import { bufferToBase64Url, checkPassword, hashPassword } from './password';

const testPassword = 'thisIsATestPassword';
const hashOfTestPassword =
  '$argon2id$v=19$m=19456,t=2,p=1$40fR6RcTofpngCk4xXhY8w$wAkstPrKkMgrb26TyNqrUzT78jZ+EIjwcJYZHcjrL+Q';

describe('hashPassword', () => {
  it('output looks like a argon2 hash', async () => {
    /*
     * a argon2 hash example with the different parts highlighted:
     * $argon2id$v=19$m=19456,t=2,p=1$40fR6RcTofpngCk4xXhY8w$wAkstPrKkMgrb26TyNqrUzT78jZ+EIjwcJYZHcjrL+Q
     * \________/\___/\______________/\_____________________/\_________________________________________/
     *     Alg    Ver    Parameters            Salt                               Hash
     */
    const regexArgon2 =
      /^\$argon2id\$v=19\$m=19456,t=2,p=1\$[\w+./]{22}\$[\w+./]{43}$/;
    const hash = await hashPassword(testPassword);
    expect(regexArgon2.test(hash)).toBeTruthy();
  });
  it('calls argon2.hash with the correct parameters', async () => {
    const spy = jest.spyOn(argon2, 'hash');
    await hashPassword(testPassword);
    expect(spy).toHaveBeenCalledWith(testPassword, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  });
});

describe('checkPassword', () => {
  it("is returning true if the inputs are a plaintext password and it's hashed version", async () => {
    await checkPassword(testPassword, hashOfTestPassword).then((result) =>
      expect(result).toBeTruthy(),
    );
  });
  it('fails, if password is non-matching', async () => {
    const password = 'anotherTestPassword';
    await checkPassword(password, hashOfTestPassword).then((result) =>
      expect(result).toBeFalsy(),
    );
  });
  it('calls argon2.verify with the correct parameters', async () => {
    const spy = jest.spyOn(argon2, 'verify');
    await checkPassword(testPassword, hashOfTestPassword);
    expect(spy).toHaveBeenCalledWith(hashOfTestPassword, testPassword);
  });
  it('verifies even passwords longer than 72 bytes', async () => {
    const password = 'a'.repeat(70);
    const hash =
      '$argon2id$v=19$m=19456,t=2,p=1$4aBLKxd7MqYQqf/th835yQ$iUMe+HHphn8B8q6gQ3IPL2k1+Bdbb505r7LuqZIMTjg';
    await checkPassword(password, hash).then((result) =>
      expect(result).toBeTruthy(),
    );
    const password2 = 'a'.repeat(73);
    await checkPassword(password2, hash).then((result) =>
      expect(result).toBeFalsy(),
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
