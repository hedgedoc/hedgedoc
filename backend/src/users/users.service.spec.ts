/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser, TableUser } from '@hedgedoc/database';
import { BadRequestException, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';
import * as uuidModule from 'uuid';

import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import { expectBindings } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockUpdate,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { UsersService } from './users.service';

jest.mock('uuid');

describe('UsersService', () => {
  const username = 'testuser';
  const displayName = 'Test User';
  const email = 'test@example.com';
  const photoUrl = 'https://example.com/photo.png';
  const userId = 123;
  const guestUuid = 'a5fdd770-4bff-4baa-bdd7-704bff7baa3c';

  let service: UsersService;
  let tracker: Tracker;
  let knexProvider: Provider;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, knexProvider],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, databaseConfigMock],
        }),
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('createUser', () => {
    it('throws BadRequestException if the username is not valid', async () => {
      const wrongUsername = 'not=valid,!$?';
      await expect(() =>
        service.createUser(wrongUsername, displayName, email, photoUrl),
      ).rejects.toThrow(BadRequestException);
    });

    it('inserts a new user', async () => {
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.displayName,
          FieldNameUser.email,
          FieldNameUser.guestUuid,
          FieldNameUser.photoUrl,
          FieldNameUser.username,
        ],
        [{ [FieldNameUser.id]: userId }],
      );
      const result = await service.createUser(
        username,
        displayName,
        email,
        photoUrl,
      );
      expect(result).toBe(userId);
      expectBindings(tracker, 'insert', [
        [expect.any(Number), displayName, email, null, photoUrl, username],
      ]);
    });

    it('throws GenericDBError if insert fails', async () => {
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.displayName,
          FieldNameUser.email,
          FieldNameUser.guestUuid,
          FieldNameUser.photoUrl,
          FieldNameUser.username,
        ],
        [],
      );
      await expect(
        service.createUser(username, displayName, email, photoUrl),
      ).rejects.toThrow(GenericDBError);
    });
  });

  describe('createGuestUser', () => {
    it('inserts a new guest user', async () => {
      // This wrong typecast is required since TypeScript does not see that
      // `uuid.v4()` returns a string or a Uint8Array based on the given options
      jest
        .spyOn(uuidModule, 'v4')
        .mockReturnValue(guestUuid as unknown as Uint8Array);
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.displayName,
          FieldNameUser.email,
          FieldNameUser.guestUuid,
          FieldNameUser.photoUrl,
          FieldNameUser.username,
        ],
        [{ [FieldNameUser.id]: userId }],
      );
      const [uuid, id] = await service.createGuestUser();
      expect(uuid).toBe(guestUuid);
      expect(id).toBe(userId);
      expectBindings(tracker, 'insert', [
        [
          expect.any(Number),
          expect.stringContaining('Guest '),
          null,
          guestUuid,
          null,
          null,
        ],
      ]);
    });

    it('throws GenericDBError if insert fails', async () => {
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.displayName,
          FieldNameUser.email,
          FieldNameUser.guestUuid,
          FieldNameUser.photoUrl,
          FieldNameUser.username,
        ],
        [],
      );
      await expect(service.createGuestUser()).rejects.toThrow(GenericDBError);
    });
  });

  describe('deleteUser', () => {
    it('deletes a user by id', async () => {
      mockDelete(tracker, TableUser, [FieldNameUser.id], 1);
      await service.deleteUser(userId);
      expectBindings(tracker, 'delete', [[userId]]);
    });

    it('throws NotInDBError if user not found', async () => {
      mockDelete(tracker, TableUser, [FieldNameUser.id], 0);
      await expect(service.deleteUser(userId)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'delete', [[userId]]);
    });
  });

  describe('updateUser', () => {
    it('updates user fields', async () => {
      mockUpdate(tracker, TableUser, [FieldNameUser.id], String(userId), 1);
      await service.updateUser(
        userId,
        'New Name',
        'new@example.com',
        'https://new.url',
      );
      expectBindings(tracker, 'update', [
        [
          {
            [FieldNameUser.displayName]: 'New Name',
            [FieldNameUser.email]: 'new@example.com',
            [FieldNameUser.photoUrl]: 'https://new.url',
          },
          userId,
        ],
      ]);
    });

    it('throws NotInDBError if update fails', async () => {
      mockUpdate(tracker, TableUser, [FieldNameUser.id], String(userId), 0);
      await expect(service.updateUser(userId, 'New Name')).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'update', [
        [{ [FieldNameUser.displayName]: 'New Name' }, userId],
      ]);
    });

    it('does nothing if no fields are provided', async () => {
      const spy = jest.spyOn(service['knex'](TableUser), 'update');
      await service.updateUser(userId);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
