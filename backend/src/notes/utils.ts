/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import base32Encode from 'base32-encode';
import { randomBytes } from 'crypto';

import { Alias } from './aliases.entity';
import { Note } from './note.entity';

/**
 * Extract the primary aliases from a aliases of a note
 * @param {Note} note - the note from which the primary aliases should be extracted
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
