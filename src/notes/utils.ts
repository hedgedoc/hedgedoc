/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import base32Encode from 'base32-encode';
import { randomBytes } from 'crypto';

import { Alias } from './alias.entity';
import { Note } from './note.entity';

/**
 * Generate publicId for a note.
 * This is a randomly generated 128-bit value encoded with base32-encode using the crockford variant and converted to lowercase.
 */
export function generatePublicId(): string {
  const randomId = randomBytes(16);
  return base32Encode(randomId, 'Crockford').toLowerCase();
}

/**
 * Extract the primary alias from a aliases of a note
 * @param {Note} note - the note from which the primary alias should be extracted
 */
export async function getPrimaryAlias(note: Note): Promise<string | undefined> {
  const listWithPrimaryAlias = (await note.aliases).filter(
    (alias: Alias) => alias.primary,
  );
  if (listWithPrimaryAlias.length !== 1) {
    return undefined;
  }
  return listWithPrimaryAlias[0].name;
}
