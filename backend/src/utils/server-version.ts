/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Optional } from '@mrdrogdrog/optional';
import { promises as fs } from 'fs';
import { join as joinPath } from 'path';

import { ServerVersion } from '../monitoring/server-status.dto';

let versionCache: ServerVersion | undefined = undefined;

/**
 * Reads the HedgeDoc version from the root package.json. This is done only once per run.
 *
 * @return {Promise<ServerVersion>} A Promise that contains the parsed server version.
 * @throws {Error} if the package.json couldn't be found or doesn't contain a correct version.
 */
export async function getServerVersionFromPackageJson(): Promise<ServerVersion> {
  if (!versionCache) {
    versionCache = await parseVersionFromPackageJson();
  }
  return versionCache;
}

async function parseVersionFromPackageJson(): Promise<ServerVersion> {
  const rawFileContent: string = await fs.readFile(
    joinPath(__dirname, '../../../package.json'),
    { encoding: 'utf8' },
  );
  const packageInfo = JSON.parse(rawFileContent) as { version: string };
  const versionParts = Optional.ofNullable(packageInfo.version)
    .orThrow(() => new Error('No version found in root package.json'))
    .map((version) => /^(\d+).(\d+).(\d+)(?:-([\w.]+))?$/g.exec(version))
    .orElseThrow(
      () =>
        new Error(
          `Version from package.json is malformed. Got ${packageInfo.version}`,
        ),
    );
  return {
    major: parseInt(versionParts[1]),
    minor: parseInt(versionParts[2]),
    patch: parseInt(versionParts[3]),
    preRelease: versionParts[4],
    fullString: versionParts[0],
  };
}

export function clearCachedVersion(): void {
  versionCache = undefined;
}
