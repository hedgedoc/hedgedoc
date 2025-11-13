/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import request from 'supertest';

import { PUBLIC_API_PREFIX } from '../src/app.module';
import { NotePermissionsDto } from '../src/dtos/note-permissions.dto';

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
