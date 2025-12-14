/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import {
  FieldNameIdentity,
  FieldNameUser,
  TableIdentity,
  TableUser,
} from '@hedgedoc/database';
import { Knex } from 'knex';

import { dateTimeToDB, getCurrentDateTime } from '../../utils/datetime';
import { hashPassword } from '../../utils/password';

export async function seed(knex: Knex): Promise<void> {
  // Clear tables beforehand
  await knex(TableUser).del();
  await knex(TableIdentity).del();

  // Insert user accounts and identities
  await knex(TableUser).insert([
    {
      [FieldNameUser.username]: null,
      [FieldNameUser.guestUuid]: '55b4618a-d5f3-4320-93d3-f3501c73d72b',
      [FieldNameUser.displayName]: 'Guest 1',
      [FieldNameUser.photoUrl]: null,
      [FieldNameUser.email]: null,
      [FieldNameUser.authorStyle]: 1,
      [FieldNameUser.createdAt]: dateTimeToDB(getCurrentDateTime()),
    },
    {
      [FieldNameUser.username]: 'test',
      [FieldNameUser.guestUuid]: null,
      [FieldNameUser.displayName]: 'Local Test User',
      [FieldNameUser.photoUrl]: null,
      [FieldNameUser.email]: null,
      [FieldNameUser.authorStyle]: 2,
      [FieldNameUser.createdAt]: dateTimeToDB(getCurrentDateTime()),
    },
  ]);
  await knex(TableIdentity).insert({
    [FieldNameIdentity.userId]: 2,
    [FieldNameIdentity.providerType]: AuthProviderType.LOCAL,
    [FieldNameIdentity.providerIdentifier]: null,
    [FieldNameIdentity.providerUserId]: null,
    [FieldNameIdentity.passwordHash]: await hashPassword('test123'),
    [FieldNameIdentity.createdAt]: dateTimeToDB(getCurrentDateTime()),
    [FieldNameIdentity.updatedAt]: dateTimeToDB(getCurrentDateTime()),
  });
}
