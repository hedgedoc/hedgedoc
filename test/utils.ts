/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';

/**
 * Ensures the directory at `path` is deleted.
 * If `path` does not exist, nothing happens.
 */
export async function ensureDeleted(path: string): Promise<void> {
  try {
    await fs.rmdir(path, { recursive: true });
  } catch (e) {
    if (e.code && e.code == 'ENOENT') {
      // ignore error, path is already deleted
      return;
    }
    throw e;
  }
}
