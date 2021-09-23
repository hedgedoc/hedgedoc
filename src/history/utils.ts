/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getPrimaryAlias } from '../notes/utils';
import { HistoryEntry } from './history-entry.entity';

export function getIdentifier(entry: HistoryEntry): string {
  if (!entry.note.aliases || entry.note.aliases.length === 0) {
    return entry.note.publicId;
  }
  const primaryAlias = getPrimaryAlias(entry.note);
  if (primaryAlias === undefined) {
    return entry.note.publicId;
  }
  return primaryAlias;
}
