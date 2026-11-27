/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';

import { clearCachedVersion, getServerVersionFromPackageJson } from './server-version';

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
        async (_) => `{ "version": "${major}.${minor}.${patch}-${preRelease}" }`,
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
      .mockImplementationOnce(async (_) => `{ "version": "${major}.${minor}.${patch}" }`);
    const serverVersion = await getServerVersionFromPackageJson();
    expect(serverVersion.major).toEqual(major);
    expect(serverVersion.minor).toEqual(minor);
    expect(serverVersion.patch).toEqual(patch);
    expect(serverVersion.preRelease).toEqual(undefined);
  });

  it.each([
    ['0.0.1', 0, 0, 1, undefined],
    ['2.0.0', 2, 0, 0, undefined],
    ['2.1.10', 2, 1, 10, undefined],
    ['10.20.30', 10, 20, 30, undefined],
    ['2.0.0-rc.1', 2, 0, 0, 'rc.1'],
    ['1.2.3-beta.4.5', 1, 2, 3, 'beta.4.5'],
    ['2.0.0-dev.20261127', 2, 0, 0, 'dev.20261127'],
  ])('parses the version %s', async (version, major, minor, patch, preRelease) => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => `{ "version": "${version}" }`);
    const serverVersion = await getServerVersionFromPackageJson();
    expect(serverVersion.major).toEqual(major);
    expect(serverVersion.minor).toEqual(minor);
    expect(serverVersion.patch).toEqual(patch);
    expect(serverVersion.preRelease).toEqual(preRelease);
    expect(serverVersion.fullString).toEqual(version);
  });

  it.each([
    '1a2b3',
    '1x2y3',
    '1-2-3',
    '1,2,3',
    '12345',
    '1.2',
    '1.2.3.4',
    '1.2.3-',
    'v1.2.3',
    ' 1.2.3',
    '1.2.3 ',
  ])('throws an error if the version %j is malformed', async (version) => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => JSON.stringify({ version }));
    await expect(getServerVersionFromPackageJson()).rejects.toThrow(
      `Version from package.json is malformed. Got ${version}`,
    );
  });

  it('rejects a long malformed version in linear time', async () => {
    const parseOnce = async (version: string): Promise<void> => {
      clearCachedVersion();
      jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => JSON.stringify({ version }));
      await getServerVersionFromPackageJson().catch(() => undefined);
    };
    // The time per call of a run of `size` digits that ends in a character no version can have
    const perCall = async (size: number): Promise<number> => {
      const version = `${'1'.repeat(size)}!`;
      let best = Infinity;
      for (let attempt = 0; attempt < 3; attempt++) {
        let calls = 0;
        const start = performance.now();
        do {
          await parseOnce(version);
          calls++;
        } while (performance.now() - start < 5);
        best = Math.min(best, (performance.now() - start) / calls);
      }
      return best;
    };

    // With unescaped dots the pattern is cubic in the length, so 4x the size costs about 64x the
    // time; a linear pass costs at most 4x. The bound sits between the two and compares two
    // timings taken the same way, so the speed of the machine cancels out. This check runs first
    // because the 50000 digits below do not finish on the cubic pattern.
    expect((await perCall(1600)) / (await perCall(400))).toBeLessThan(12);

    clearCachedVersion();
    jest
      .spyOn(fs, 'readFile')
      .mockImplementationOnce(async (_) => JSON.stringify({ version: `${'1'.repeat(50000)}!` }));
    await expect(getServerVersionFromPackageJson()).rejects.toThrow(
      'Version from package.json is malformed.',
    );
  });

  it("throws an error if package.json can't be found", async () => {
    jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => {
      throw new Error('package.json not found');
    });
    await expect(getServerVersionFromPackageJson()).rejects.toThrow('package.json not found');
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
      .mockImplementationOnce(async (_) => `{ "version": "TwoDotZeroDotZero" }`);
    await expect(getServerVersionFromPackageJson()).rejects.toThrow(
      'Version from package.json is malformed. Got TwoDotZeroDotZero',
    );
  });
});
