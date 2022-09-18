/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getPrimaryAlias } from '../notes/utils';
import { HistoryEntry } from './history-entry.entity';

export async function getIdentifier(entry: HistoryEntry): Promise<string> {
  const aliases = await (await entry.note).aliases;
  if (!aliases || aliases.length === 0) {
    return (await entry.note).publicId;
  }
  const primaryAlias = await getPrimaryAlias(await entry.note);
  if (primaryAlias === undefined) {
    return (await entry.note).publicId;
  }
  return primaryAlias;
}
