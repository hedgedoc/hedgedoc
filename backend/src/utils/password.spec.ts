/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import argon2 from '@node-rs/argon2';

import {
  bufferToBase64Url,
  checkPassword,
  checkTokenEquality,
  hashApiToken,
  hashPassword,
} from './password';

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

describe('hashApiToken', () => {
  it('correctly hashes a string', () => {
    const testToken =
      'LaD52wgw7pi5zVitv4gR5lxoUa6ncTQGASPmXDSdppB9xcd9kCtqjlrdQ8OOfmG9DNXGvfkIwaOCAv8nRp8IoQ';
    expect(hashApiToken(testToken)).toEqual(
      'd820de9eb5ace767c14c02f61b9522485f565201443fd366e6ca0d8a18dcffecf91cb27911b8cac566c3aaced44d02b0441a3b72380479f69eaea0f12e4bd73b',
    );
  });
});

describe('checkTokenEquality', () => {
  const testToken =
    'q72OIg1Y0sKvtsRmxtl86AwWfAF1V7LbVFt5PS0k73iyv3DtpG7Fdn2CADBlq5NsnSWMxGzYLeyux0cdFULmiw';
  const hasedTestToken = hashApiToken(testToken);
  it('returns true if the token hashes are the same', () => {
    expect(checkTokenEquality(testToken, hasedTestToken)).toEqual(true);
  });
  it('returns false if the token hashes are the same', () => {
    expect(checkTokenEquality(testToken, hashApiToken('test'))).toEqual(false);
  });
});
