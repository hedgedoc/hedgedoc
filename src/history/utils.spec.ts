/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import { HistoryEntry } from './history-entry.entity';
import { getIdentifier } from './utils';

describe('getIdentifier', () => {
  const alias = 'alias';
  let note: Note;
  let entry: HistoryEntry;
  beforeEach(() => {
    const user = User.create('hardcoded', 'Testy') as User;
    note = Note.create(user, alias) as Note;
    entry = HistoryEntry.create(user, note) as HistoryEntry;
  });
  it('returns the publicId if there are no aliases', () => {
    note.aliases = undefined as unknown as Alias[];
    expect(getIdentifier(entry)).toEqual(note.publicId);
  });
  it('returns the publicId, if the alias array is empty', () => {
    note.aliases = [];
    expect(getIdentifier(entry)).toEqual(note.publicId);
  });
  it('returns the publicId, if the only alias is not primary', () => {
    note.aliases[0].primary = false;
    expect(getIdentifier(entry)).toEqual(note.publicId);
  });
  it('returns the primary alias, if one exists', () => {
    expect(getIdentifier(entry)).toEqual(note.aliases[0].name);
  });
});
