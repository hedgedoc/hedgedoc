/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { randomBytes } from 'crypto';

import { User } from '../users/user.entity';
import { Alias } from './alias.entity';
import { Note } from './note.entity';
import { generatePublicId, getPrimaryAlias } from './utils';

jest.mock('crypto');
const random128bitBuffer = Buffer.from([
  0xe1, 0x75, 0x86, 0xb7, 0xc3, 0xfb, 0x03, 0xa9, 0x26, 0x9f, 0xc9, 0xd6, 0x8c,
  0x2d, 0x7b, 0x7b,
]);
const mockRandomBytes = randomBytes as jest.MockedFunction<typeof randomBytes>;
mockRandomBytes.mockImplementation((_) => random128bitBuffer);

it('generatePublicId', () => {
  expect(generatePublicId()).toEqual('w5trddy3zc1tj9mzs7b8rbbvfc');
});

describe('getPrimaryAlias', () => {
  const alias = 'alias';
  let note: Note;
  beforeEach(() => {
    const user = User.create('hardcoded', 'Testy') as User;
    note = Note.create(user, alias) as Note;
  });
  it('finds correct primary alias', async () => {
    (await note.aliases).push(Alias.create('annother', note, false) as Alias);
    expect(await getPrimaryAlias(note)).toEqual(alias);
  });
  it('returns undefined if there is no alias', async () => {
    (await note.aliases)[0].primary = false;
    expect(await getPrimaryAlias(note)).toEqual(undefined);
  });
});
