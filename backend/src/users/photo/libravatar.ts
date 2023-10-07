/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import crypto from 'crypto';
import dns from 'node:dns';
import { URL } from 'url';

export enum LibravatarFallbackType {
  NOT_FOUND = '404',
  SILHOUETTE = 'mm',
  IDENTICON = 'identicon',
  MONSTER_ID = 'monsterid',
  WAVATAR = 'wavatar',
  RETRO = 'retro',
  ROBO_HASH = 'robohash',
  PAGAN = 'pagan',
}

/**
 * Generates an avatar URL for a given email address by using federated Libravatar.
 * @param email The email address of the user.
 * @param size The size of the image in pixels.
 * @param defaultFallback The type of fallback image to use when no image is found for the user.
 * @return The URL of the avatar image for the user
 */
export async function generateAvatarUrlFromEmail(
  email: string,
  size = 96,
  defaultFallback: LibravatarFallbackType = LibravatarFallbackType.IDENTICON,
): Promise<string> {
  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
    throw new Error('Invalid email address provided');
  }
  const avatarServer = await lookupAvatarServer(emailParts[1]);
  const emailHash = crypto.createHash('md5').update(email).digest('hex');
  return createAvatarUrl(avatarServer, emailHash, size, defaultFallback);
}

export async function generateAvatarUrlFromOpenid(
  openid: string,
  size = 96,
  defaultFallback: LibravatarFallbackType = LibravatarFallbackType.IDENTICON,
): Promise<string> {
  const openidUrl = new URL(openid);
  const hash = crypto
    .createHash('sha256')
    .update(openidUrl.toString())
    .digest('hex');
  const avatarServer = await lookupAvatarServer(openidUrl.hostname);
  return createAvatarUrl(avatarServer, hash, size, defaultFallback);
}

function createAvatarUrl(
  serverURL: URL,
  hash: string,
  size: number,
  defaultFallback: LibravatarFallbackType,
): string {
  serverURL.pathname = `/avatar/${hash}?s=${size}&d=${defaultFallback}`;
  return serverURL.toString();
}

async function lookupAvatarServer(userDomain: string): Promise<URL> {
  return (
    (await lookupAvatarServerFromDns(userDomain, true)) ??
    (await lookupAvatarServerFromDns(userDomain, false)) ??
    new URL('https://seccdn.libravatar.org')
  );
}

async function lookupAvatarServerFromDns(
  domain: string,
  secure: boolean,
): Promise<URL | null> {
  const srvType = secure ? '_avatars-sec._tcp' : '_avatars._tcp';
  const srvRecord = await lookupSrv(srvType, domain);
  if (!srvRecord) {
    return null;
  }
  const hostName = srvRecord.name;
  const port = srvRecord.port;
  const protocol = secure ? 'https:' : 'http:';
  const url = new URL('https://example.com');
  url.host = hostName;
  url.port = `${port}`;
  url.protocol = protocol;
  return url;
}

async function lookupSrv(
  srvType: string,
  domain: string,
): Promise<dns.SrvRecord | null> {
  const resolved = await dns.promises.resolveSrv(`${srvType}.${domain}`);
  if (resolved.length < 1) {
    return null;
  }
  const recordsByPriority: Map<number, dns.SrvRecord[]> = new Map(
    [
      ...resolved.reduce((records, currentRecord) => {
        records.set(
          currentRecord.priority,
          (records.get(currentRecord.priority) ?? []).concat(currentRecord),
        );
        return records;
      }, new Map<number, dns.SrvRecord[]>()),
    ].sort(),
  );
  for (const priority of recordsByPriority.keys()) {
    const recordsByWeight =
      recordsByPriority
        .get(priority)
        ?.sort((recordA, recordB) => recordB.weight - recordA.weight) ?? [];
    for (const record of recordsByWeight) {
      if (record.name.trim() !== '' && isValidSrvPort(record.port)) {
        return record;
      }
    }
  }
  return null;
}

function isValidSrvPort(port: number): boolean {
  return port > 1 && port < 65535;
}
