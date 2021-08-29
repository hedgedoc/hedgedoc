/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';

import { getServerVersionFromPackageJson } from './serverVersion';

it('getServerVersionFromPackageJson works', async () => {
  const major = 2;
  const minor = 0;
  const patch = 0;
  const preRelease = 'dev';
  /* eslint-disable @typescript-eslint/require-await*/
  jest.spyOn(fs, 'readFile').mockImplementationOnce(async (_) => {
    return `{
"version": "${major}.${minor}.${patch}"
}
`;
  });
  const serverVersion = await getServerVersionFromPackageJson();
  expect(serverVersion.major).toEqual(major);
  expect(serverVersion.minor).toEqual(minor);
  expect(serverVersion.patch).toEqual(patch);
  expect(serverVersion.preRelease).toEqual(preRelease);
});
