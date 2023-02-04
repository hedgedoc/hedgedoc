/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';

import {
  clearCachedVersion,
  getServerVersionFromPackageJson,
} from './serverVersion';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('getServerVersionFromPackageJson', () => {
  afterEach(() => {
    clearCachedVersion();
  });

  it('parses a complete version string', async () => {
    const major = 2;
    const minor = 0;
    const patch = 0;
    const preRelease = 'dev';
    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(
        async (_) =>
          `{ "version": "${major}.${minor}.${patch}-${preRelease}" }`,
      );
    const serverVersion = await getServerVersionFromPackageJson();
    expect(serverVersion.major).toEqual(major);
    expect(serverVersion.minor).toEqual(minor);
    expect(serverVersion.patch).toEqual(patch);
    expect(serverVersion.preRelease).toEqual(preRelease);
  });

  it('parses a version string without pre release', async () => {
    const major = 2;
    const minor = 0;
    const patch = 0;
    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(
        async (_) => `{ "version": "${major}.${minor}.${patch}" }`,
      );
    const serverVersion = await getServerVersionFromPackageJson();
    expect(serverVersion.major).toEqual(major);
    expect(serverVersion.minor).toEqual(minor);
    expect(serverVersion.patch).toEqual(patch);
    expect(serverVersion.preRelease).toEqual(undefined);
  });

  it("throws an error if package.json can't be found", async () => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => {
      throw new Error('package.json not found');
    });
    await expect(getServerVersionFromPackageJson()).rejects.toThrow(
      'package.json not found',
    );
  });

  it("throws an error if version isn't present in package.json", async () => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => `{ }`);
    await expect(getServerVersionFromPackageJson()).rejects.toThrow(
      'No version found in root package.json',
    );
  });

  it('throws an error if the version is malformed', async () => {
    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(
        async (_) => `{ "version": "TwoDotZeroDotZero" }`,
      );
    await expect(getServerVersionFromPackageJson()).rejects.toThrow(
      'Version from package.json is malformed. Got TwoDotZeroDotZero',
    );
  });
});
