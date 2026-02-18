/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import request from 'supertest';
import { PUBLIC_API_PREFIX } from '../src/app.module';
import { NotePermissionsDto } from '../src/dtos/note-permissions.dto';

export const DefaultTestAlias = 'an-alias';
export const DefaultMixedCaseTestAlias = 'aN-aLiAS';
export const AliasTestCases = [
  ['with lower case alias', DefaultTestAlias, DefaultTestAlias.toUpperCase()],
  ['with mixed case alias', DefaultMixedCaseTestAlias, DefaultMixedCaseTestAlias.toUpperCase()],
];

/**
 * Ensures the directory at `path` is deleted.
 * If `path` does not exist, nothing happens.
 */
export async function ensureDeleted(path: string): Promise<void> {
  try {
    await fs.rm(path, { recursive: true });
  } catch (e) {
    if (e.code && e.code == 'ENOENT') {
      // ignore error, path is already deleted
      return;
    }
    throw e;
  }
}

/**
 * Expect permissions of a note via the Public API.
 *
 * @param agent - the {@link request.SuperAgentTest agent} to use for this test
 * @param token - the public api token to be used for authorization
 * @param noteAlias - The alias for the note to check
 * @param owner - The owner of the note to check for
 * @param userPermissions - The user permissions to check for
 * @param groupPermissions - The group permissions to check for
 */
export async function expectPublicAPIPermissions(
  agent: request.SuperAgentTest,
  token: string,
  noteAlias: string,
  owner: string,
  userPermissions: Set<NotePermissionsDto['sharedToUsers'][number]>,
  groupPermissions: Set<NotePermissionsDto['sharedToGroups'][number]>,
): Promise<void> {
  const permissions = await agent
    .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias}/metadata/permissions`)
    .set('Authorization', token)
    .expect('Content-Type', /json/)
    .expect(200);
  expect(permissions.body.owner).toBe(owner);
  expect(new Set(permissions.body.sharedToUsers)).toEqual(userPermissions);
  expect(new Set(permissions.body.sharedToGroups)).toEqual(groupPermissions);
}
