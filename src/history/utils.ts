/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getPrimaryAlias } from '../notes/utils';
import { HistoryEntry } from './history-entry.entity';

export async function getIdentifier(entry: HistoryEntry): Promise<string> {
  const aliases = await entry.note.aliases;
  if (!aliases || aliases.length === 0) {
    return entry.note.publicId;
  }
  const primaryAlias = await getPrimaryAlias(entry.note);
  if (primaryAlias === undefined) {
    return entry.note.publicId;
  }
  return primaryAlias;
}
