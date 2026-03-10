/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser, TableUser, User } from '@hedgedoc/database';
import { BadRequestException, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';
import * as uuidModule from 'uuid';

import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import { expectBindings, IS_FIRST } from '../database/mock/expect-bindings';
import { mockDelete, mockInsert, mockSelect, mockUpdate } from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { dateTimeToDB, getCurrentDateTime } from '../utils/datetime';
import { UsersService } from './users.service';
import { UserInfoDto } from '../dtos/user-info.dto';

jest.mock('uuid');

describe('UsersService', () => {
  const username = 'TestUser';
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
      jest.useFakeTimers();
      const now = getCurrentDateTime();
      mockSelect(tracker, [FieldNameUser.username], TableUser, FieldNameUser.username);
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.createdAt,
          FieldNameUser.displayName,
          FieldNameUser.email,
          FieldNameUser.guestUuid,
          FieldNameUser.photoUrl,
          FieldNameUser.username,
        ],
        [{ [FieldNameUser.id]: userId }],
      );
      const result = await service.createUser(username, displayName, email, photoUrl);
      expect(result).toBe(userId);
      expectBindings(tracker, 'select', [[username.toLowerCase()]]);
      expectBindings(tracker, 'insert', [
        [expect.any(Number), dateTimeToDB(now), displayName, email, null, photoUrl, username],
      ]);
      jest.useRealTimers();
    });

    it('throws GenericDBError if insert fails', async () => {
      mockSelect(tracker, [FieldNameUser.username], TableUser, FieldNameUser.username);
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
      await expect(service.createUser(username, displayName, email, photoUrl)).rejects.toThrow(
        GenericDBError,
      );
    });
  });

  describe('createGuestUser', () => {
    it('inserts a new guest user', async () => {
      jest.useFakeTimers();
      const now = getCurrentDateTime();
      // This wrong typecast is required since TypeScript does not see that
      // `uuid.v4()` returns a string or a Uint8Array based on the given options
      jest.spyOn(uuidModule, 'v4').mockReturnValue(guestUuid as unknown as Uint8Array);
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.createdAt,
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
          dateTimeToDB(now),
          expect.stringContaining('Guest '),
          null,
          guestUuid,
          null,
          null,
        ],
      ]);
      jest.useRealTimers();
    });

    it('throws GenericDBError if insert fails', async () => {
      mockInsert(
        tracker,
        TableUser,
        [
          FieldNameUser.authorStyle,
          FieldNameUser.createdAt,
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
      mockUpdate(
        tracker,
        TableUser,
        [FieldNameUser.displayName, FieldNameUser.email, FieldNameUser.photoUrl],
        FieldNameUser.id,
        1,
      );
      await service.updateUser(userId, 'New Name', 'new@example.com', 'https://new.url');
      expectBindings(tracker, 'update', [
        ['New Name', 'new@example.com', 'https://new.url', userId],
      ]);
    });

    it('throws NotInDBError if update fails', async () => {
      mockUpdate(tracker, TableUser, [FieldNameUser.displayName], FieldNameUser.id, 0);
      await expect(service.updateUser(userId, 'New Name')).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'update', [['New Name', userId]]);
    });

    it('does nothing if no fields are provided', async () => {
      const spy = jest.spyOn(service['knex'](TableUser), 'update');
      await service.updateUser(userId);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe.each([
    ['returns true if username already exists', [{ [FieldNameUser.username]: username }], true],
    ['returns false if username does not already exists', [], false],
  ])('isUsernameTaken', (title, returnValue, result) => {
    it(title, async () => {
      mockSelect(tracker, [FieldNameUser.username], TableUser, FieldNameUser.username, returnValue);
      expect(await service.isUsernameTaken(username)).toBe(result);
      expectBindings(tracker, 'select', [[username.toLowerCase()]]);
    });
  });

  describe.each([
    ['returns false if user is a guest', [{ [FieldNameUser.username]: null }], false],
    ['returns false if user does not exist', [], false],
    ['returns true if user is not a guest', [{ [FieldNameUser.username]: username }], true],
  ])('isRegisteredUser', (title, returnValue, result) => {
    it(title, async () => {
      mockSelect(tracker, [FieldNameUser.username], TableUser, FieldNameUser.id, returnValue);
      expect(await service.isRegisteredUser(userId)).toBe(result);
      expectBindings(tracker, 'select', [[userId, IS_FIRST]]);
    });
  });

  describe('getUserIdByUsername', () => {
    it('returns userId if user exists', async () => {
      mockSelect(tracker, [FieldNameUser.id], TableUser, FieldNameUser.username, [
        { [FieldNameUser.id]: userId },
      ]);
      const result = await service.getUserIdByUsername(username);
      expect(result).toEqual(userId);
      expectBindings(tracker, 'select', [[username.toLowerCase(), IS_FIRST]]);
    });
    it('throws NotInDBError if user does not exists', async () => {
      mockSelect(tracker, [FieldNameUser.id], TableUser, FieldNameUser.username, []);
      await expect(service.getUserIdByUsername(username)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[username.toLowerCase(), IS_FIRST]]);
    });
  });

  describe('getUserIdByGuestUuid', () => {
    it('returns userId if guest exists', async () => {
      mockSelect(tracker, [FieldNameUser.id], TableUser, FieldNameUser.guestUuid, [
        { [FieldNameUser.id]: userId },
      ]);
      const result = await service.getUserIdByGuestUuid(guestUuid);
      expect(result).toEqual(userId);
      expectBindings(tracker, 'select', [[guestUuid, IS_FIRST]]);
    });
    it('throws NotInDBError if guest does not exists', async () => {
      mockSelect(tracker, [FieldNameUser.id], TableUser, FieldNameUser.guestUuid, []);
      await expect(service.getUserIdByGuestUuid(guestUuid)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[guestUuid, IS_FIRST]]);
    });
  });

  describe('getUserDtoByUsername', () => {
    it('returns UserInfoDto if user exists', async () => {
      mockSelect(tracker, [], TableUser, FieldNameUser.username, [
        {
          [FieldNameUser.id]: userId,
          [FieldNameUser.username]: username,
          [FieldNameUser.displayName]: displayName,
          [FieldNameUser.photoUrl]: photoUrl,
        },
      ]);
      const result = await service.getUserDtoByUsername(username);
      expect(result).toEqual(
        UserInfoDto.create({
          username: username,
          displayName: displayName,
          photoUrl: photoUrl,
        }),
      );
      expectBindings(tracker, 'select', [[username.toLowerCase(), IS_FIRST]]);
    });
    it('returns UserInfoDto if user exists and no displayName', async () => {
      mockSelect(tracker, [], TableUser, FieldNameUser.username, [
        {
          [FieldNameUser.id]: userId,
          [FieldNameUser.username]: username,
          [FieldNameUser.displayName]: undefined,
          [FieldNameUser.photoUrl]: photoUrl,
        },
      ]);
      const result = await service.getUserDtoByUsername(username);
      expect(result).toEqual(
        UserInfoDto.create({
          username: username,
          displayName: username,
          photoUrl: photoUrl,
        }),
      );
      expectBindings(tracker, 'select', [[username.toLowerCase(), IS_FIRST]]);
    });
    it('throws NotInDBError if user does not exists', async () => {
      mockSelect(tracker, [], TableUser, FieldNameUser.username, []);
      await expect(service.getUserDtoByUsername(username)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[username.toLowerCase(), IS_FIRST]]);
    });
  });

  describe('getUserById', () => {
    it('returns User if user does exists', async () => {
      jest.useFakeTimers();
      const now = getCurrentDateTime();
      mockSelect(tracker, [], TableUser, FieldNameUser.id, [
        {
          [FieldNameUser.id]: userId,
          [FieldNameUser.username]: username,
          [FieldNameUser.guestUuid]: null,
          [FieldNameUser.displayName]: displayName,
          [FieldNameUser.createdAt]: dateTimeToDB(now),
          [FieldNameUser.photoUrl]: photoUrl,
          [FieldNameUser.email]: email,
          [FieldNameUser.authorStyle]: 1,
        },
      ]);
      const result = await service.getUserById(userId);
      expect(result).toEqual({
        [FieldNameUser.id]: userId,
        [FieldNameUser.username]: username,
        [FieldNameUser.guestUuid]: null,
        [FieldNameUser.displayName]: displayName,
        [FieldNameUser.createdAt]: dateTimeToDB(now),
        [FieldNameUser.photoUrl]: photoUrl,
        [FieldNameUser.email]: email,
        [FieldNameUser.authorStyle]: 1,
      } as User);
      expectBindings(tracker, 'select', [[userId, IS_FIRST]]);
    });
    it('throws NotInDBError if user does not exists', async () => {
      mockSelect(tracker, [], TableUser, FieldNameUser.id, []);
      await expect(service.getUserById(userId)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[userId, IS_FIRST]]);
    });
  });
});
